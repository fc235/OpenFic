"""Verify the actual package contents for server and desktop distributions."""

import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import zipfile

import pytest


@pytest.fixture
def package_project(tmp_path: Path) -> Path:
    source = Path(__file__).resolve().parents[1]
    project = tmp_path / "backend"
    project.mkdir()
    for name in ("pyproject.toml", "hatch_build.py", "README.md", "LICENSE", "alembic.ini"):
        shutil.copy2(source / name, project / name)
    shutil.copy2(source / "LICENSE", tmp_path / "LICENSE")
    (project / "app").mkdir()
    (project / "app" / "__init__.py").write_text("", encoding="utf-8")
    (project / "app" / "skills").mkdir()
    (project / "app" / "skills" / "example.md").write_text("skill", encoding="utf-8")
    (project / "frontend").mkdir()
    (project / "frontend" / "index.html").write_text("packaged frontend", encoding="utf-8")
    return project


def build_package(project: Path, target: str, *, desktop: bool) -> Path:
    uv = shutil.which("uv")
    if uv is None:
        pytest.skip("Package archive tests require uv")
    env = os.environ.copy()
    env.pop("OPENFIC_DESKTOP_BUILD", None)
    if desktop:
        env["OPENFIC_DESKTOP_BUILD"] = "1"
    result = subprocess.run(
        [uv, "build", f"--{target}", "--out-dir", "artifacts"],
        cwd=project, env=env, capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stderr
    return next((project / "artifacts").glob("*.whl" if target == "wheel" else "*.tar.gz"))


def test_desktop_wheel_excludes_existing_frontend(package_project: Path) -> None:
    wheel = build_package(package_project, "wheel", desktop=True)
    with zipfile.ZipFile(wheel) as archive:
        assert "app/__init__.py" in archive.namelist()
        assert "alembic.ini" in archive.namelist()
        assert not any(name.startswith("frontend/") for name in archive.namelist())


def test_desktop_wheel_does_not_require_frontend_build(package_project: Path) -> None:
    shutil.rmtree(package_project / "frontend")
    (package_project.parent / "frontend").mkdir()
    wheel = build_package(package_project, "wheel", desktop=True)
    with zipfile.ZipFile(wheel) as archive:
        assert "app/__init__.py" in archive.namelist()
        assert not any(name.startswith("frontend/") for name in archive.namelist())


def test_server_wheel_includes_frontend(package_project: Path) -> None:
    wheel = build_package(package_project, "wheel", desktop=False)
    with zipfile.ZipFile(wheel) as archive:
        assert archive.read("frontend/index.html") == b"packaged frontend"


def test_sdist_retains_frontend_even_with_desktop_flag(package_project: Path) -> None:
    sdist = build_package(package_project, "sdist", desktop=True)
    with tarfile.open(sdist) as archive:
        assert any(name.endswith("/frontend/index.html") for name in archive.getnames())
        destination = package_project.parent / "unpacked"
        archive.extractall(destination, filter="data")
    wheel = build_package(next(destination.iterdir()), "wheel", desktop=False)
    with zipfile.ZipFile(wheel) as archive:
        assert archive.read("frontend/index.html") == b"packaged frontend"

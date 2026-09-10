import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";

import "./project-scope-banner.css";
import { ProjectReferences } from "./project-references";

export function ProjectScopeBanner({
  projectId,
  projectTitle,
  resource,
}: {
  projectId: string | null;
  projectTitle?: string;
  resource: "characters" | "worldInfo";
}) {
  const { t } = useTranslation();
  return (
    <div className="project-scope-banner" role="status">
      <Folder size={18} aria-hidden="true" className="project-scope-banner-icon" />
      <div className="project-scope-banner-content">
        <div className="project-scope-banner-heading">
          <span className="project-scope-banner-label">{t("projectScope.label")}</span>
          <strong className="project-scope-banner-title" title={projectTitle}>
            {projectId ? projectTitle || t("projectScope.loading") : t("projectScope.noProject")}
          </strong>
        </div>
        <div className="project-scope-banner-description">
          {t(projectId ? `projectScope.${resource}` : "projectScope.selectProject")}
        </div>
        {projectId && <ProjectReferences key={`${projectId}:${resource}`} projectId={projectId} resource={resource} />}
      </div>
    </div>
  );
}

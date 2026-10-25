package com.openfic.mobile

/** Key capture policy, kept independent of Android for local JVM tests. */
internal class ReadingVolumeKeys {
    enum class Direction { PREVIOUS, NEXT }
    data class Result(val consumed: Boolean, val direction: Direction? = null)

    private var enabled = false
    private val captured = mutableSetOf<Int>()

    fun setEnabled(enabled: Boolean) {
        this.enabled = enabled
    }

    fun reset() {
        enabled = false
        // Keep release balance if a key is still down during a lifecycle change.
        // A fresh initial down below discards a stale press whose up was lost.
    }

    fun onKeyDown(keyCode: Int, repeatCount: Int): Result {
        val direction = when (keyCode) {
            24 -> Direction.PREVIOUS
            25 -> Direction.NEXT
            else -> return Result(false)
        }
        if (repeatCount == 0) captured.remove(keyCode)
        if (keyCode in captured) return Result(true)
        if (!enabled) return Result(false)
        captured.add(keyCode)
        return Result(true, if (repeatCount == 0) direction else null)
    }

    fun onKeyUp(keyCode: Int): Boolean = captured.remove(keyCode)
}

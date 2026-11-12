package com.openfic.mobile

import org.junit.Assert.*
import org.junit.Test

class ReadingVolumeKeysTest {
    @Test fun volumeKeysPassThroughOutsideReading() {
        val keys = ReadingVolumeKeys()
        for (code in listOf(24, 25)) {
            assertFalse(keys.onKeyDown(code, 0).consumed)
            assertFalse(keys.onKeyDown(code, 1).consumed)
            assertFalse(keys.onKeyUp(code))
        }
    }

    @Test fun volumeUpPagesPreviousOncePerPress() {
        val keys = ReadingVolumeKeys()
        keys.setEnabled(true)
        val first = keys.onKeyDown(24, 0)
        assertTrue(first.consumed)
        assertEquals(ReadingVolumeKeys.Direction.PREVIOUS, first.direction)
        assertTrue(keys.onKeyDown(24, 1).consumed)
        assertNull(keys.onKeyDown(24, 2).direction)
        assertTrue(keys.onKeyUp(24))
        assertFalse(keys.onKeyUp(24))
        assertEquals(ReadingVolumeKeys.Direction.PREVIOUS, keys.onKeyDown(24, 0).direction)
    }

    @Test fun volumeDownPagesNextAndOtherKeysPassThrough() {
        val keys = ReadingVolumeKeys()
        keys.setEnabled(true)
        assertEquals(ReadingVolumeKeys.Direction.NEXT, keys.onKeyDown(25, 0).direction)
        assertFalse(keys.onKeyDown(66, 0).consumed)
        assertFalse(keys.onKeyUp(66))
        assertTrue(keys.onKeyUp(25))
    }

    @Test fun disablingWhileHeldConsumesRepeatsAndBalancesReleaseWithoutPaging() {
        val keys = ReadingVolumeKeys()
        keys.setEnabled(true)
        keys.onKeyDown(25, 0)
        keys.setEnabled(false)
        assertTrue(keys.onKeyDown(25, 1).consumed)
        assertNull(keys.onKeyDown(25, 2).direction)
        assertTrue(keys.onKeyUp(25))
        assertFalse(keys.onKeyDown(25, 0).consumed)
        assertFalse(keys.onKeyUp(25))
    }

    @Test fun lifecycleResetDisablesNewPressesButBalancesAnExistingPress() {
        val keys = ReadingVolumeKeys()
        keys.setEnabled(true)
        keys.onKeyDown(24, 0)
        keys.reset()
        assertFalse(keys.onKeyDown(25, 0).consumed)
        assertTrue(keys.onKeyUp(24))
        assertFalse(keys.onKeyDown(24, 0).consumed)
        keys.setEnabled(true)
        assertEquals(ReadingVolumeKeys.Direction.NEXT, keys.onKeyDown(25, 0).direction)
    }

    @Test fun staleCapturedPressDoesNotCaptureANewPressAfterReset() {
        val keys = ReadingVolumeKeys()
        keys.setEnabled(true)
        keys.onKeyDown(24, 0)
        keys.reset()
        // A focus transition can prevent delivery of the old key-up.
        assertFalse(keys.onKeyDown(24, 0).consumed)
        assertFalse(keys.onKeyUp(24))
    }

    @Test fun enablingDuringAHeldSystemKeyDoesNotPageOnRepeat() {
        val keys = ReadingVolumeKeys()
        keys.onKeyDown(25, 0)
        keys.setEnabled(true)
        assertTrue(keys.onKeyDown(25, 1).consumed)
        assertNull(keys.onKeyDown(25, 2).direction)
        assertTrue(keys.onKeyUp(25))
    }
}

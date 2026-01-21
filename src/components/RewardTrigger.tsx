'use client'

import { useState } from 'react'
import ScratchRewardModal from './ScratchRewardModal'

interface RewardTriggerProps {
    orderId: string
    isGuest?: boolean
}

export default function RewardTrigger({ orderId, isGuest }: RewardTriggerProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <ScratchRewardModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            orderId={orderId}
            isGuest={isGuest}
        />
    )
}

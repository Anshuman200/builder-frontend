"use client";

import React from "react";
import { Segmented } from "antd";
import type { SegmentedProps } from "antd";

/**
 * PillSegmented — A premium, pill-shaped alternative to Ant Design's Segmented component.
 * Features a dark, bordered container and a vibrant violet selection pill.
 * This component is designed to be used for high-level view switches and tabs.
 */
export interface PillSegmentedProps extends Omit<SegmentedProps, 'value' | 'onChange'> {
    value?: any;
    onChange?: (value: any) => void;
}

export default function PillSegmented(props: PillSegmentedProps) {
    return (
        <Segmented 
            {...(props as any)} 
            className={`pc-segmented ${props.className || ''}`} 
        />
    );
}

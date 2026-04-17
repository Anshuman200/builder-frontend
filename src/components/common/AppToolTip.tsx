"use client";

import React from "react";
import { Tooltip } from "antd";
import type { TooltipProps } from "antd";
import { cn } from "@/lib/utils";

interface AppToolTipProps extends TooltipProps {
    children: React.ReactNode;
    title: React.ReactNode;
    maxWidth?: number;
    className?: string;
}

const AppToolTip = ({
    children,
    title,
    placement = "top",
    arrow = true,
    maxWidth = 220,
    className,
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.05,
    ...restProps
}: AppToolTipProps) => {

    return (
        <Tooltip
            title={
                <div className="text-sm leading-relaxed whitespace-pre-line">
                    {title}
                </div>
            }
            open={restProps.open}
            placement={placement}
            arrow={arrow}
            mouseEnterDelay={mouseEnterDelay}
            mouseLeaveDelay={mouseLeaveDelay}
            classNames={{
                root: cn(
                    "rounded-lg shadow-md backdrop-blur-sm",
                    className
                ),
            }}
            {...restProps}
        >
            <span className="inline-flex">{children}</span>
        </Tooltip>
    );
};

export default AppToolTip;
"use client"

import React, { useEffect, useState } from "react"
import type { LinkProps } from "next/link"
import { motion } from "motion/react"

import { cn } from "@/utils/tailwind"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

type HoverBorderGradientProps = React.PropsWithChildren<{
  as?: React.ElementType
  containerClassName?: string
  className?: string
  duration?: number
  clockwise?: boolean
}> &
  Omit<
    React.HTMLAttributes<HTMLElement>,
    "as" | "className" | "children" | "href"
  > & {
    href?: LinkProps["href"]
  }

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps) {
  const [hovered, setHovered] = useState(false)
  const [direction, setDirection] = useState<Direction>("TOP")

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(22% 55% at 50% 0%, rgb(167, 243, 208) 0%, rgba(52, 211, 153, 0.45) 35%, rgba(0, 0, 0, 0) 100%)",
    LEFT: "radial-gradient(18% 48% at 0% 50%, rgb(110, 231, 183) 0%, rgba(16, 185, 129, 0.4) 40%, rgba(0, 0, 0, 0) 100%)",
    BOTTOM:
      "radial-gradient(22% 55% at 50% 100%, rgb(52, 211, 153) 0%, rgba(5, 150, 105, 0.45) 38%, rgba(0, 0, 0, 0) 100%)",
    RIGHT:
      "radial-gradient(18% 48% at 100% 50%, rgb(110, 231, 183) 0%, rgba(16, 185, 129, 0.4) 40%, rgba(0, 0, 0, 0) 100%)",
  }

  const highlight =
    "radial-gradient(78% 185% at 50% 50%, #6ee7b7 0%, #34d399 28%, rgba(16, 185, 129, 0.35) 55%, rgba(0, 0, 0, 0) 100%)"

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => {
          const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
          const currentIndex = directions.indexOf(prevState)
          const nextIndex = clockwise
            ? (currentIndex - 1 + directions.length) % directions.length
            : (currentIndex + 1) % directions.length
          return directions[nextIndex]!
        })
      }, duration * 1000)
      return () => clearInterval(interval)
    }
  }, [hovered, duration, clockwise])

  return (
    <Tag
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex h-min w-fit flex-none flex-col flex-nowrap items-center justify-center gap-10 overflow-visible rounded-full border border-emerald-500/50 bg-black/45 p-px decoration-clone transition duration-500 content-center hover:border-emerald-400/70 hover:bg-emerald-950/35 dark:border-emerald-400/40 dark:bg-black/55 dark:hover:border-emerald-300/60 dark:hover:bg-emerald-950/40",
        containerClassName,
      )}
      {...props}
    >
      <div
        className={cn(
          "z-10 w-auto rounded-[inherit] bg-neutral-950 px-4 py-2 font-semibold text-white shadow-inner shadow-black/20 transition-[background-color,box-shadow,color] duration-300 group-hover:bg-neutral-900 group-hover:text-emerald-50 group-hover:shadow-[0_0_28px_-6px_rgba(52,211,153,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
          className,
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
        style={{
          filter: hovered ? "blur(3px)" : "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="absolute inset-[2px] z-[1] flex-none rounded-[100px] bg-neutral-950 transition-colors duration-300 group-hover:bg-neutral-900" />
    </Tag>
  )
}

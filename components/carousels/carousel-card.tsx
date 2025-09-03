"use client";

import { ContextMenuCard } from "@/components/context-menu-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

// Improved TypeScript interfaces
interface Screenshot {
  url: string | StaticImport;
}

interface DataFields {
  Screenshots?: Screenshot[];
  "S3 Links"?: string;
  "Flow Name": string;
}

interface CarouselData {
  fields: DataFields;
}

interface CarouselCardProps {
  data: CarouselData;
  onSave?: () => void;
  onDownload?: () => void;
  onCopyLink?: () => void;
}

export function CarouselCard({
  data,
  onSave,
  onDownload,
  onCopyLink,
}: CarouselCardProps) {
  // State management
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);
  const [scrollPrev, setScrollPrev] = useState<boolean>(false);
  const [scrollNext, setScrollNext] = useState<boolean>(true);

  // Memoized calculations
  const screenshots = React.useMemo(() => {
    if (data?.fields?.["S3 Links"]) {
      return data.fields["S3 Links"]
        .split(",")
        .map((link: string) => link.trim())
        .filter(Boolean);
    }
    return data?.fields?.Screenshots || [];
  }, [data?.fields?.Screenshots, data?.fields?.["S3 Links"]]);

  const totalSlides = screenshots.length;
  const hasMultipleSlides = totalSlides > 1;

  // Event handlers
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
    } else {
      alert("Saved!!");
    }
  }, [onSave]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    }
  }, [onDownload]);

  const handleCopyLink = useCallback(() => {
    if (onCopyLink) {
      onCopyLink();
    }
  }, [onCopyLink]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  // Carousel API effects
  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setScrollPrev(api.canScrollPrev());
      setScrollNext(api.canScrollNext());
    };

    // Initial state
    updateCarouselState();

    // Listen to select events
    api.on("select", updateCarouselState);

    // Cleanup
    return () => {
      api.off("select", updateCarouselState);
    };
  }, [api]);

  // Early return if no screenshots
  if (!data?.fields?.Screenshots && !data?.fields?.["S3 Links"]) {
    return null;
  }

  const flowName = data.fields["Flow Name"];
  const firstScreenshot = Array.isArray(screenshots)
    ? screenshots[0]
    : typeof screenshots === "string"
    ? screenshots
    : (screenshots as Screenshot)?.url;

  return (
    <ContextMenuCard>
      <div className="group relative flex flex-col gap-y-3 md:gap-y-4">
        {/* Main link overlay */}
        <Link
          href="/"
          className="peer absolute inset-0 z-10"
          aria-label={`View ${flowName}`}
        />

        {/* Mobile view - single image */}
        {firstScreenshot && (
          <div className="md:hidden">
            <Image
              src={
                typeof firstScreenshot === "string"
                  ? firstScreenshot
                  : (firstScreenshot as Screenshot).url
              }
              alt={`${flowName} preview`}
              width={300}
              height={800}
              className="rounded-3xl overflow-hidden w-full h-auto"
              priority
            />
          </div>
        )}

        {/* Desktop view - carousel */}
        <div className="relative rounded-[28px] overflow-hidden w-full hidden md:block md:bg-foreground/[0.04] md:group-hover:bg-foreground/[0.06] transition duration-300 md:pt-6 md:pb-7">
          <Carousel
            setApi={setApi}
            className="m-0"
            opts={{
              align: "end",
              duration: 20,
            }}
          >
            <CarouselContent className="m-0">
              {Array.isArray(screenshots)
                ? screenshots.map((screenshot, index) => (
                    <CarouselItem key={index} className="px-7">
                      <Image
                        src={
                          typeof screenshot === "string"
                            ? screenshot
                            : screenshot.url
                        }
                        alt={`${flowName} screen ${index + 1}`}
                        width={300}
                        height={800}
                        className="rounded-3xl overflow-hidden max-h-[583px] object-cover"
                        priority={index === 0}
                      />
                    </CarouselItem>
                  ))
                : screenshots && (
                    <CarouselItem className="px-7">
                      <Image
                        src={
                          typeof screenshots === "string"
                            ? screenshots
                            : (screenshots as Screenshot).url
                        }
                        alt={`${flowName} preview`}
                        width={300}
                        height={800}
                        className="rounded-3xl overflow-hidden max-h-[583px] object-cover"
                        priority
                      />
                    </CarouselItem>
                  )}
            </CarouselContent>

            {/* Navigation arrows - only show if multiple slides */}
            {hasMultipleSlides && (
              <>
                <CarouselPrevious
                  variant="ghost"
                  className={cn(
                    "invisible group-hover:visible ml-14 rounded-xl size-10 bg-background z-50 transition-opacity",
                    scrollPrev
                      ? "opacity-100"
                      : "opacity-50 pointer-events-none"
                  )}
                  aria-label="Previous image"
                />
                <CarouselNext
                  variant="ghost"
                  className={cn(
                    "invisible group-hover:visible mr-14 rounded-xl size-10 bg-background z-50 transition-opacity",
                    scrollNext
                      ? "opacity-100"
                      : "opacity-50 pointer-events-none"
                  )}
                  aria-label="Next image"
                />
              </>
            )}
          </Carousel>

          {/* Carousel indicators - only show if multiple slides */}
          {hasMultipleSlides && (
            <div className="absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 invisible group-hover:visible">
              <div
                className="flex gap-3"
                role="tablist"
                aria-label="Image indicators"
              >
                {Array.from({ length: Math.min(totalSlides, 5) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      className="relative size-1.5 overflow-hidden rounded-full"
                      role="tab"
                      aria-selected={current === index + 1}
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => api?.scrollTo(index)}
                    >
                      <div className="w-full h-full bg-muted-foreground/30 dark:bg-muted-foreground/70 absolute"></div>
                      <div
                        className={cn(
                          "h-full bg-primary relative w-0 z-10 transition-all duration-200",
                          current === index + 1 ? "w-full" : ""
                        )}
                      />
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card footer with app info and actions */}
        <div className="flex items-center gap-x-3 w-full">
          {/* App icon placeholder */}
          <div
            className="shrink-0 h-10 w-10 bg-[#eaeaea] rounded-xl overflow-hidden"
            role="img"
            aria-label="App icon"
          />

          {/* App info */}
          <div className="flex grow flex-col min-w-0">
            <span className="line-clamp-1 text-body-medium-bold underline decoration-transparent group-hover:decoration-current transition-colors ease-out">
              {flowName}
            </span>
            <span className="line-clamp-1 text-sm text-muted-foreground font-normal">
              {flowName}
            </span>
          </div>

          {/* Action buttons */}
          <div
            className={cn(
              "gap-x-2 transition ease-out",
              "hidden group-focus-within:flex group-hover:flex",
              menuOpen && "flex"
            )}
          >
            <TooltipProvider delayDuration={0}>
              {/* Save button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-xl z-50"
                    onClick={handleSave}
                    aria-label="Save to collections"
                  >
                    <Icons.bookmark className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    sideOffset={10}
                    className="rounded-lg text-xs"
                  >
                    <p>Save to collections</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>

              {/* Options menu */}
              <Tooltip>
                <DropdownMenu open={menuOpen} onOpenChange={toggleMenu}>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl z-50"
                        aria-label="More options"
                      >
                        <Icons.options className="size-5" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <button
                        className="flex justify-start items-center gap-x-2 w-full"
                        onClick={handleDownload}
                      >
                        <Icons.download className="size-5" />
                        <span>Download all screens</span>
                        <Badge className="px-2 font-medium uppercase border-none">
                          PRO
                        </Badge>
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="flex justify-start items-center gap-x-2 w-full"
                        onClick={handleCopyLink}
                      >
                        <Icons.link className="size-5" />
                        <span>Copy link app</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <TooltipPortal>
                  <TooltipContent
                    sideOffset={10}
                    className="rounded-lg text-xs"
                  >
                    <p>Download & Share</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </ContextMenuCard>
  );
}

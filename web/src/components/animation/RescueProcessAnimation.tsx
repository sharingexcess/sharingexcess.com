import {
  AppleIcon,
  CarrotIcon,
  FridgeIcon,
  GroupIcon,
  LeafyGreenIcon,
  VanIcon,
  WarehouseIcon,
  WorshipIcon,
} from "@/components/animation/rescueProcessIcons";
import { cn } from "@/lib/cn";
import { gsap, registerGsapPlugins, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { forwardRef, useRef, type ReactNode } from "react";

/** Ground line offset from the container bottom — fixed for the short strip layout. */
const GROUND_BOTTOM = "0.625rem";

const STRIP_HEIGHT_CLASS = "h-[9.5rem]";

const STRIP_WIDTH_CLASS = "mx-auto w-full max-w-full md:w-1/2";

/** Van stays at this horizontal position in the viewport while the world scrolls beneath. */
const VAN_SCREEN_RATIO = 0.28;

/** Scene icons share h-16 — truck aspect ratio used for stop spacing math. */
const SCENE_ICON_HEIGHT_PX = 64;
const TRUCK_ASPECT_RATIO = 70 / 42;
const STOP_GAP_PX = 8;
/** Truck pulls slightly past each stop — location sits behind the cab. */
const STOP_AFTER_RATIO = 0.45;

const ICON_SIZES = {
  scene: "h-16 w-auto",
  produce: "h-8 w-8",
} as const;

const DROPOFF_ICONS = [GroupIcon, WorshipIcon, FridgeIcon] as const;

/** Content width (buildings live here); extra tail is road-only for seamless loop. */
const CONTENT_WIDTH_RATIO = 5.8;
const ROAD_TAIL_RATIO = 0.7;
const WORLD_WIDTH_RATIO = CONTENT_WIDTH_RATIO + ROAD_TAIL_RATIO;

/** Content-width positions for buildings (animation math uses these). */
const FARM_CONTENT_LEFT = 28;
const COMMUNITY_CONTENT_LEFTS = [60, 72, 84] as const;

/** Map a content-% position onto the wider world strip (road tail follows content). */
function worldLeftFromContentPercent(contentPercent: number) {
  return `${((CONTENT_WIDTH_RATIO * contentPercent) / WORLD_WIDTH_RATIO).toFixed(3)}%`;
}

const FARM_LEFT = worldLeftFromContentPercent(FARM_CONTENT_LEFT);
const COMMUNITY_LEFTS = COMMUNITY_CONTENT_LEFTS.map(worldLeftFromContentPercent) as readonly string[];

/** Pixels of world scroll per second — constant speed between stops. */
const SCROLL_SPEED_RATIO = 0.42;

const HOLD_FARM_S = 1.35;
const HOLD_DELIVERY_S = 0.55;
const HOLD_TAIL_S = 0.45;

const PICKUP_EMERGE_S = 0.24;
const PICKUP_EMERGE_STAGGER = 0.16;
const PICKUP_TRANSFER_S = 0.55;
const PICKUP_LOAD_S = 0.36;
const PICKUP_LOAD_DROP_PX = 18;

const PRODUCE_ITEMS = [
  { Icon: AppleIcon, className: "" },
  { Icon: LeafyGreenIcon, className: "" },
  { Icon: CarrotIcon, className: "" },
] as const;

const TRAVEL_EASE = "power1.inOut";

export interface RescueProcessAnimationProps {
  className?: string;
}

function RoadLine({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0 h-0.5 w-full bg-white", className)}
    />
  );
}

function SceneRoad() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{ bottom: GROUND_BOTTOM, height: 0 }}
    >
      <RoadLine />
    </div>
  );
}

const Grounded = forwardRef<
  HTMLDivElement,
  { left: string | number; className?: string; children: ReactNode }
>(function Grounded({ left, className, children }, ref) {
  return (
    <div
      ref={ref}
      className={cn("absolute flex items-end justify-center", className)}
      style={{ left, bottom: GROUND_BOTTOM, transform: "translateX(-50%)" }}
    >
      {children}
    </div>
  );
});

function StaticScene({ className }: { className?: string }) {
  return (
    <div className={cn(STRIP_WIDTH_CLASS, className)}>
      <div
        className={cn("relative w-full overflow-hidden text-white/85", STRIP_HEIGHT_CLASS)}
        aria-hidden
      >
        <SceneRoad />
        <Grounded left={FARM_LEFT}>
          <WarehouseIcon className={ICON_SIZES.scene} />
        </Grounded>
        {COMMUNITY_LEFTS.map((left, index) => {
          const DropoffIcon = DROPOFF_ICONS[index];
          return (
            <Grounded key={left} left={left}>
              <DropoffIcon className={ICON_SIZES.scene} />
            </Grounded>
          );
        })}
        <div
          className="absolute z-10 flex items-end"
          style={{
            left: `${VAN_SCREEN_RATIO * 100}%`,
            bottom: GROUND_BOTTOM,
            transform: "translateX(-50%)",
          }}
        >
          <VanIcon className={ICON_SIZES.scene} />
        </div>
      </div>
    </div>
  );
}

export function RescueProcessAnimation({ className }: RescueProcessAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const warehouseRef = useRef<HTMLDivElement>(null);
  const produceRef = useRef<HTMLDivElement>(null);
  const produceItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dropoffRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;

      registerGsapPlugins();

      const container = containerRef.current;
      const world = worldRef.current;
      const warehouse = warehouseRef.current;
      const produce = produceRef.current;
      const produceItems = produceItemRefs.current.filter(Boolean) as HTMLDivElement[];
      const communities = dropoffRefs.current.filter(Boolean) as HTMLDivElement[];

      if (
        !container ||
        !world ||
        !warehouse ||
        !produce ||
        produceItems.length !== PRODUCE_ITEMS.length ||
        communities.length === 0
      ) {
        return;
      }

      const viewport = container.offsetWidth;
      const contentWidth = viewport * CONTENT_WIDTH_RATIO;
      const worldWidth = viewport * WORLD_WIDTH_RATIO;
      const vanScreenX = viewport * VAN_SCREEN_RATIO;

      const farmWorldX = contentWidth * (FARM_CONTENT_LEFT / 100);
      const communityWorldXs = COMMUNITY_CONTENT_LEFTS.map(
        (left) => contentWidth * (left / 100),
      );

      // Scroll until the viewport shows only the tail road — road still fills the frame.
      const scrollEnd = worldWidth - viewport;

      const iconWidthPx = SCENE_ICON_HEIGHT_PX * TRUCK_ASPECT_RATIO;
      const stopAfterPx = iconWidthPx * STOP_AFTER_RATIO + STOP_GAP_PX;

      const worldAtStop = (buildingWorldX: number) =>
        vanScreenX - buildingWorldX - stopAfterPx;

      const stopXs = [
        worldAtStop(farmWorldX),
        ...communityWorldXs.map(worldAtStop),
        -scrollEnd,
      ];

      const scrollSpeed = viewport * SCROLL_SPEED_RATIO;
      let pickupTransferX = 0;

      const positionProduceAtWarehouse = () => {
        const containerRect = container.getBoundingClientRect();
        const warehouseRect = warehouse.getBoundingClientRect();
        const warehouseScreenX =
          warehouseRect.left + warehouseRect.width / 2 - containerRect.left;
        const warehouseTopInContainer = warehouseRect.top - containerRect.top;
        const produceBottom = container.offsetHeight - warehouseTopInContainer + 8;

        pickupTransferX = vanScreenX - warehouseScreenX;

        gsap.set(produce, {
          left: warehouseScreenX,
          bottom: produceBottom,
          x: 0,
          xPercent: -50,
          y: 0,
        });
        gsap.set(produceItems, { opacity: 0, scale: 0.45, y: 14 });
      };

      const resetScene = () => {
        gsap.set(world, { x: 0 });
        gsap.set(produce, {
          x: 0,
          y: 0,
          clearProps: "left,bottom",
        });
        gsap.set(produceItems, { opacity: 0, scale: 0.45, y: 0 });
        gsap.set(communities, { scale: 1 });
      };

      resetScene();

      const tl = gsap.timeline({ repeat: -1, onRepeat: resetScene });

      let scrollX = 0;

      const travelTo = (toX: number) => {
        const distance = Math.abs(toX - scrollX);
        scrollX = toX;
        if (distance < 0.5) return;
        tl.to(world, {
          x: toX,
          duration: distance / scrollSpeed,
          ease: TRAVEL_EASE,
        });
      };

      const hold = (duration: number) => {
        tl.to({}, { duration });
      };

      // Approach warehouse — produce emerges one-by-one, shifts to the truck, then drops in.
      travelTo(stopXs[0]);
      tl.call(positionProduceAtWarehouse);
      tl.to(produceItems, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: PICKUP_EMERGE_S,
        stagger: PICKUP_EMERGE_STAGGER,
        ease: "power2.out",
      });
      tl.to(produce, {
        x: () => pickupTransferX,
        duration: PICKUP_TRANSFER_S,
        ease: "power2.inOut",
      });
      hold(HOLD_FARM_S * 0.2);
      tl.to(produceItems, {
        opacity: 0,
        y: PICKUP_LOAD_DROP_PX,
        scale: 0.6,
        duration: PICKUP_LOAD_S,
        ease: "power2.in",
      });
      hold(HOLD_FARM_S * 0.15);

      // Deliveries — smooth travel between each stop with a brief pause.
      communityWorldXs.forEach((_, index) => {
        travelTo(stopXs[index + 1]);
        hold(HOLD_DELIVERY_S * 0.35);
        tl.to(
          communities[index],
          { scale: 1.06, duration: 0.26, yoyo: true, repeat: 1, ease: "power1.inOut" },
          "<",
        );
        hold(HOLD_DELIVERY_S * 0.65);
      });

      // Exit — last building leaves frame, then empty road for seamless loop.
      travelTo(stopXs[stopXs.length - 1]);
      hold(HOLD_TAIL_S);

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [reduceMotion] },
  );

  if (reduceMotion) {
    return <StaticScene className={className} />;
  }

  return (
    <div className={cn(STRIP_WIDTH_CLASS, className)}>
      <div
        ref={containerRef}
        className={cn("relative w-full overflow-hidden text-white/85", STRIP_HEIGHT_CLASS)}
        aria-hidden
      >
        <div
          ref={worldRef}
          className="absolute inset-y-0 left-0 will-change-transform"
          style={{ width: `${WORLD_WIDTH_RATIO * 100}%` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{ bottom: GROUND_BOTTOM, height: 0 }}
          >
            <RoadLine />
          </div>

          <Grounded left={FARM_LEFT} ref={warehouseRef}>
            <WarehouseIcon className={ICON_SIZES.scene} />
          </Grounded>

          {COMMUNITY_LEFTS.map((left, index) => {
            const DropoffIcon = DROPOFF_ICONS[index];
            return (
              <Grounded
                key={left}
                ref={(node) => {
                  dropoffRefs.current[index] = node;
                }}
                left={left}
              >
                <DropoffIcon className={ICON_SIZES.scene} />
              </Grounded>
            );
          })}
        </div>

        <div
          ref={produceRef}
          className="pointer-events-none absolute z-20 flex items-end justify-center gap-1.5 will-change-transform"
        >
          {PRODUCE_ITEMS.map(({ Icon, className: iconClassName }, index) => (
            <div
              key={index}
              ref={(node) => {
                produceItemRefs.current[index] = node;
              }}
              className="flex items-end"
            >
              <Icon className={cn(ICON_SIZES.produce, iconClassName)} />
            </div>
          ))}
        </div>

        <div
          className="absolute z-10 flex items-end justify-center"
          style={{
            left: `${VAN_SCREEN_RATIO * 100}%`,
            bottom: GROUND_BOTTOM,
            transform: "translateX(-50%)",
          }}
        >
          <VanIcon className={ICON_SIZES.scene} />
        </div>
      </div>
    </div>
  );
}

export default RescueProcessAnimation;

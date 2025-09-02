import { cn } from "@/lib/utils";
import { CarouselCard } from "./carousels/carousel-card";
import { CheckboxCard } from "./checkbox-card";
import { getAirtableRecords } from "@/lib/airtable";

interface CardsListProps {
  platform: string;
  feature: string;
  record?: any;
}

const GridCard = ({ children }: { children: React.ReactNode }) => (
  <div
    className={cn(
      "grid content-start [--column-gap:12px] md:[--column-gap:24px] gap-x-[--column-gap] gap-y-8 md:gap-y-10 [--min-column-width:169px] md:[--min-column-width:208px] lg:[--min-column-width:243px] [--max-column-count:7] [--total-gap-width:calc((var(--max-column-count)-1)*var(--column-gap))] [--max-column-width:calc((100%-var(--total-gap-width))/var(--max-column-count))] grid-cols-[repeat(auto-fill,minmax(max(var(--min-column-width),var(--max-column-width)),1fr))]"
    )}
  >
    {children}
  </div>
);

// Define the shape of your data for CarouselCard
type CarouselCardData = {
  id: string;
  title: string;
  imageUrl: string;
  // Add other fields used inside CarouselCard
};

// Renders appropriate component based on feature
const FeatureComponent = ({
  feature,
  record,
}: {
  feature: string;
  record: any;
}) => {
  switch (feature) {
    case "apps":
      return <AppsComponent data={record} />;
    case "screens":
      return <ScreensComponent />;
    case "ui-elements":
      return <UiElementsComponent />;
    case "flows":
      return <FlowsComponent data={record} />;
    default:
      return null;
  }
};

// Apps: renders real data
const AppsComponent = ({ data }: { data: CarouselCardData[] }) => (
  <GridCard>
    {data?.map((item: CarouselCardData) => (
      <CarouselCard key={item.id} data={item} />
    ))}
  </GridCard>
);

// Screens: renders 10 placeholder checkboxes
const ScreensComponent = () => (
  <GridCard>
    {Array.from({ length: 10 }).map((_, index) => (
      <CheckboxCard key={index} id={index} />
    ))}
  </GridCard>
);

// UI Elements: same as screens
const UiElementsComponent = () => (
  <GridCard>
    {Array.from({ length: 10 }).map((_, index) => (
      <CheckboxCard key={index} id={index} />
    ))}
  </GridCard>
);

// Flows: assuming record is an array like AppsComponent
const FlowsComponent = ({ data }: { data: CarouselCardData[] }) => (
  <GridCard>
    {data?.map((item: CarouselCardData) => (
      <CarouselCard key={item.id} data={item} />
    ))}
  </GridCard>
);

// Main export
export async function CardsList({ platform, feature }: CardsListProps) {
  const records = await getAirtableRecords(); // optionally filter here
  return <FeatureComponent feature={feature} record={records} />;
}

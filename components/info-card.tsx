import { Card } from "@/components/ui/card";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
export type InfoCardProps = {
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
  number: string;
  description: string;
};
export const InfoCard: React.FC<InfoCardProps> = (props) => {
  return (
    <Card className="bg-transparent backdrop-blur-sm">
      <div className="flex justify-between p-3">
        {props.Icon && <props.Icon />}
        {props.title && <div>{props.title}</div>}
      </div>
      <div className=" flex flex-col p-3 text-left gap-2">
        <span className="text-xl">{props.number}</span>
        <p className="pt-2 text-sm">{props.description}</p>
      </div>
    </Card>
  );
};

export default InfoCard;

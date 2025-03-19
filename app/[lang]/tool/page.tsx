
import { HID } from "@/components/hid";
import { Button } from "@/components/ui/button";
import { getDictionary, LangProps } from "@/lib/dictionaries";

const Tools = async ({ params }: LangProps) => {
  const { lang } = await params;
  const dict = await getDictionary(lang);



  return (
    <div className="flex flex-col my-12 gap-6">
     <HID />
    </div>
  );
};

export default Tools;

export async function generateMetadata() {
  return {
    title: "Makcu 在线烧录工具",
    description: "",
  };
}

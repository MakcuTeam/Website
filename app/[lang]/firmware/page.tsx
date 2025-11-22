import { DeviceTool } from "@/components/deviceTool";
import { getDictionary, LangProps } from "@/lib/dictionaries";

const Firmware = async ({ params }: LangProps) => {
  const { lang } = await params;

  return (
    <div className="flex flex-col my-12 gap-6">
      <DeviceTool lang={lang} />
    </div>
  );
};

export default Firmware;

export async function generateMetadata({ params }: LangProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `Makcu ${dict.tools.title}`,
    description: "",
  };
}


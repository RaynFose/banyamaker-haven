import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SizeConfigurationProps {
  size: {
    width: number;
    length: number;
    height: number;
  };
  onChange: (dimension: "width" | "length" | "height", value: number[]) => void;
}

const SizeConfiguration = ({ size, onChange }: SizeConfigurationProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Размеры</h2>
      <div className="space-y-8">
        <div className="space-y-4">
          <Label>Ширина (м): {size.width}м</Label>
          <Slider
            defaultValue={[size.width]}
            max={8}
            min={2}
            step={0.5}
            onValueChange={(value) => onChange("width", value)}
          />
        </div>
        <div className="space-y-4">
          <Label>Длина (м): {size.length}м</Label>
          <Slider
            defaultValue={[size.length]}
            max={12}
            min={3}
            step={0.5}
            onValueChange={(value) => onChange("length", value)}
          />
        </div>
        <div className="space-y-4">
          <Label>Высота (м): {size.height}м</Label>
          <Slider
            defaultValue={[size.height]}
            max={4}
            min={2}
            step={0.1}
            onValueChange={(value) => onChange("height", value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SizeConfiguration;
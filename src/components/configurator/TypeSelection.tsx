import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TypeSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

const TypeSelection = ({ value, onChange }: TypeSelectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Выберите тип бани</h2>
      <RadioGroup
        defaultValue={value}
        onValueChange={onChange}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="classic" id="classic" />
            <Label htmlFor="classic">Классическая баня</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="barrel" id="barrel" />
            <Label htmlFor="barrel">Баня-бочка</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mobile" id="mobile" />
            <Label htmlFor="mobile">Мобильная баня</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium">Премиум СПА</Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TypeSelection;
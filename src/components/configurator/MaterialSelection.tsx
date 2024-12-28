import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MaterialSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

const MaterialSelection = ({ value, onChange }: MaterialSelectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Материалы</h2>
      <div className="space-y-4">
        <Label>Основной материал</Label>
        <Select
          defaultValue={value}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите материал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pine">Сосна</SelectItem>
            <SelectItem value="cedar">Кедр</SelectItem>
            <SelectItem value="larch">Лиственница</SelectItem>
            <SelectItem value="oak">Дуб</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MaterialSelection;
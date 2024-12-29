import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const Configurator = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    type: "classic",
    size: {
      width: 4,
      length: 6,
      height: 2.5
    },
    rooms: ["steam"],
    material: "pine",
    extras: []
  });

  const handleSizeChange = (dimension: "width" | "length" | "height", value: number[]) => {
    setConfig(prev => ({
      ...prev,
      size: {
        ...prev.size,
        [dimension]: value[0]
      }
    }));
  };

  const handleSubmit = () => {
    toast({
      title: "Конфигурация отправлена",
      description: "Наш менеджер свяжется с вами в ближайшее время для уточнения деталей",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Конфигуратор бани</h1>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= num ? "bg-wood text-white" : "bg-gray-200"
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Выберите тип бани</h2>
            <RadioGroup
              defaultValue={config.type}
              onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
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
        )}

        {/* Step 2: Size Configuration */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Размеры</h2>
            <div className="space-y-8">
              <div className="space-y-4">
                <Label>Ширина (м): {config.size.width}м</Label>
                <Slider
                  defaultValue={[config.size.width]}
                  max={8}
                  min={2}
                  step={0.5}
                  onValueChange={(value) => handleSizeChange("width", value)}
                />
              </div>
              <div className="space-y-4">
                <Label>Длина (м): {config.size.length}м</Label>
                <Slider
                  defaultValue={[config.size.length]}
                  max={12}
                  min={3}
                  step={0.5}
                  onValueChange={(value) => handleSizeChange("length", value)}
                />
              </div>
              <div className="space-y-4">
                <Label>Высота (м): {config.size.height}м</Label>
                <Slider
                  defaultValue={[config.size.height]}
                  max={4}
                  min={2}
                  step={0.1}
                  onValueChange={(value) => handleSizeChange("height", value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Materials */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Материалы</h2>
            <div className="space-y-4">
              <Label>Основной материал</Label>
              <Select
                defaultValue={config.material}
                onValueChange={(value) => setConfig(prev => ({ ...prev, material: value }))}
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
        )}

        {/* Step 4: Contact Information */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Контактная информация</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя</Label>
                <Input id="name" placeholder="Иван Иванов" />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 (999) 999-99-99" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@mail.ru" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
            >
              Назад
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="ml-auto"
              onClick={() => setStep(prev => prev + 1)}
            >
              Далее
            </Button>
          ) : (
            <Button
              className="ml-auto"
              onClick={handleSubmit}
            >
              Отправить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configurator;
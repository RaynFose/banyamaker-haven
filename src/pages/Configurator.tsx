import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BathPreview from "@/components/configurator/BathPreview";
import TypeSelection from "@/components/configurator/TypeSelection";
import SizeConfiguration from "@/components/configurator/SizeConfiguration";
import MaterialSelection from "@/components/configurator/MaterialSelection";
import ContactForm from "@/components/configurator/ContactForm";

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
    material: "pine",
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3D Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <BathPreview
            width={config.size.width}
            length={config.size.length}
            height={config.size.height}
            type={config.type}
          />
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
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

          {/* Steps */}
          {step === 1 && (
            <TypeSelection
              value={config.type}
              onChange={(value) => setConfig(prev => ({ ...prev, type: value }))}
            />
          )}

          {step === 2 && (
            <SizeConfiguration
              size={config.size}
              onChange={handleSizeChange}
            />
          )}

          {step === 3 && (
            <MaterialSelection
              value={config.material}
              onChange={(value) => setConfig(prev => ({ ...prev, material: value }))}
            />
          )}

          {step === 4 && (
            <ContactForm onSubmit={handleSubmit} />
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
    </div>
  );
};

export default Configurator;
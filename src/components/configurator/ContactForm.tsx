import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  onSubmit: () => void;
}

const ContactForm = ({ onSubmit }: ContactFormProps) => {
  return (
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
  );
};

export default ContactForm;
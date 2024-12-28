import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const benefits = [
    "Собственное производство",
    "Опыт с 2010 года",
    "Гарантия 5 лет",
    "Экологичные материалы",
    "Быстрые сроки строительства",
    "Работаем под ключ"
  ];

  const popularModels = [
    {
      name: "Классическая баня",
      description: "Традиционная русская баня с парной и комнатой отдыха",
      price: "от 350 000 ₽",
      image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb"
    },
    {
      name: "Баня-бочка",
      description: "Компактное решение для небольших участков",
      price: "от 280 000 ₽",
      image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86"
    },
    {
      name: "Премиум СПА",
      description: "Баня с расширенной зоной отдыха и СПА-функциями",
      price: "от 850 000 ₽",
      image: "https://images.unsplash.com/photo-1515859005217-8a1f08870f59"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Постройте баню своей мечты
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Создаем уникальные бани под ключ с учетом всех ваших пожеланий
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-wood hover:bg-wood-dark text-white px-8 py-6 text-lg"
            >
              <Link to="/configurator">
                Создать свою баню
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              <Link to="/catalog">
                Готовые решения
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Models Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Популярные модели
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularModels.map((model, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                  <p className="text-gray-600 mb-4">{model.description}</p>
                  <p className="text-wood font-bold text-lg mb-4">{model.price}</p>
                  <Button
                    asChild
                    className="w-full bg-wood hover:bg-wood-dark"
                  >
                    <Link to="/catalog">
                      Подробнее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-wood flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-wood text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Готовы начать строительство?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами для бесплатной консультации и расчета стоимости
          </p>
          <Button
            asChild
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
          >
            <Link to="/contacts">
              Связаться с нами
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
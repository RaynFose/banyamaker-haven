import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-graphite text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-2xl mb-4">БаниПро</h3>
            <p className="text-gray-300">
              Строительство премиальных бань под ключ с 2010 года
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-300 hover:text-white transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/configurator" className="text-gray-300 hover:text-white transition-colors">
                  Конфигуратор
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="text-gray-300 hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl mb-4">Контакты</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-2">
                <Phone size={20} />
                <a href="tel:+71234567890" className="text-gray-300 hover:text-white transition-colors">
                  +7 (123) 456-78-90
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={20} />
                <a href="mailto:info@banipro.ru" className="text-gray-300 hover:text-white transition-colors">
                  info@banipro.ru
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={20} />
                <span className="text-gray-300">
                  г. Москва, ул. Банная, 1
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl mb-4">Режим работы</h4>
            <p className="text-gray-300">
              Пн-Пт: 9:00 - 20:00
              <br />
              Сб-Вс: 10:00 - 18:00
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} БаниПро. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
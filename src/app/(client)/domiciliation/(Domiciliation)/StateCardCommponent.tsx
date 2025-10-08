import { Check, Clock } from 'lucide-react';

type CardStatus = 'completed' | 'in-progress' | 'pending'

type CardProps = {
  title: string;
  description: string;
  status?: CardStatus | string;
  number?: number;
};

type StateCardsProps = {
  cards: CardProps[];
};

export default function StateCards({ cards}: StateCardsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 mb-5 gap-4 md:gap-20`}>
      {cards.map((card, index) => (
        <div
          key={index}
          className='pl-5 md:pl-20'
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-1 md:p-2 rounded-full flex items-center justify-center ${
                card.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : card.status === 'in-progress'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {card.number ? (
                <span className="font-medium text-sm w-5 h-5 text-center text-gray-900">{card.number}</span>
              ) : card.status === 'completed' ? (
                <Check className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-900">{card.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
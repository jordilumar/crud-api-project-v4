import CarItem from './CarItem';

export default function CarList({ cars, onEdit, onDelete, animationClass, onViewSales, onRemoveFavorite }) {
  return (
    <div className={`car-list-container ${animationClass}`}>
      <div className="car-grid">
        {cars.map((car, index) => (
          <CarItem
            key={car.id}
            car={car}
            index={index}
            onEdit={onEdit}
            onDelete={() => onDelete(car)}
            onViewSales={onViewSales}
            onRemoveFavorite={onRemoveFavorite}
          />
        ))}
      </div>
    </div>
  );
}

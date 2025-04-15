import CarItem from './CarItem';

export default function CarList({ cars, onEdit, onDelete, animationClass, isLoading, onViewSales, onRemoveFavorite }) {
  return (
    <div className={`car-list-container ${animationClass}`}>
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

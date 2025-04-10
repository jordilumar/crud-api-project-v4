class Sale:
    def __init__(self, year, model, country, units_sold, total_units=None):
        self.year = year
        self.model = model
        self.country = country
        self.units_sold = units_sold
        self.total_units = total_units  # Nuevo atributo para el total de unidades vendidas

    def to_dict(self):
        return {
            "year": self.year,
            "model": self.model,
            "country": self.country,
            "units_sold": self.units_sold,
            "total_units": self.total_units,  # Incluir en la representación como diccionario
        }

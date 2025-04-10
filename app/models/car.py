class Car:
    def __init__(self, id, make, model, year, features):
        self.id = id
        self.make = make
        self.model = model
        self.year = year
        self.features = features

    def to_dict(self):
        return {
            "id": self.id,
            "make": self.make,
            "model": self.model,
            "year": self.year,
            "features": self.features
        }
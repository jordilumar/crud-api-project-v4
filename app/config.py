import os

# Clave secreta para JWT
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_key_CHANGE_IN_PRODUCTION")

# Otras configuraciones que puedas necesitar
DEBUG = True
DATABASE_DIR = os.path.join(os.path.dirname(__file__), 'database')
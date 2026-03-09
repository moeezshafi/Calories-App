from database import db
from flask import Flask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///calorie_tracker.db'
db.init_app(app)

with app.app_context():
    try:
        # Check if column exists
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('recipe_ingredient')]
        
        if 'amount_g' in columns:
            print('Column amount_g already exists')
        else:
            # Add the column
            with db.engine.connect() as conn:
                conn.execute(db.text('ALTER TABLE recipe_ingredient ADD COLUMN amount_g FLOAT DEFAULT 0'))
                conn.commit()
            print('Column amount_g added successfully')
    except Exception as e:
        print(f'Error: {e}')

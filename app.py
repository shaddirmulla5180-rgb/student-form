from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import traceback

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize database
db = SQLAlchemy(app)

# Student Model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.Text, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    course = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.strftime('%Y-%m-%d'),
            'gender': self.gender,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'course': self.course,
            'semester': self.semester,
            'enrollment_date': self.enrollment_date.strftime('%Y-%m-%d %H:%M:%S')
        }

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    try:
        # Get form data
        data = request.form
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'phone', 'date_of_birth', 
                          'gender', 'address', 'city', 'state', 'zip_code', 'country', 
                          'course', 'semester']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Field {field} is required'
                }), 400
        
        # Parse date of birth
        try:
            dob = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid date format. Please use YYYY-MM-DD'
            }), 400
        
        # Check if email already exists
        existing_student = Student.query.filter_by(email=data.get('email')).first()
        if existing_student:
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 400
        
        # Create new student
        student = Student(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            date_of_birth=dob,
            gender=data.get('gender'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            country=data.get('country'),
            course=data.get('course'),
            semester=data.get('semester')
        )
        
        # Add to database
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful!',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in register: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500

@app.route('/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        return jsonify([student.to_dict() for student in students])
    except Exception as e:
        print(f"Error in get_students: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Failed to load students: {str(e)}'
        }), 500

@app.route('/student/<int:id>', methods=['GET'])
def get_student(id):
    try:
        student = Student.query.get_or_404(id)
        return jsonify(student.to_dict())
    except Exception as e:
        print(f"Error in get_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Failed to load student: {str(e)}'
        }), 500

@app.route('/student/<int:id>', methods=['PUT'])
def update_student(id):
    try:
        student = Student.query.get_or_404(id)
        data = request.form
        
        # Update fields if provided
        if data.get('first_name'):
            student.first_name = data.get('first_name')
        if data.get('last_name'):
            student.last_name = data.get('last_name')
        if data.get('email'):
            # Check if new email already exists (excluding current student)
            existing = Student.query.filter(Student.email == data.get('email'), Student.id != id).first()
            if existing:
                return jsonify({
                    'success': False,
                    'message': 'Email already exists'
                }), 400
            student.email = data.get('email')
        if data.get('phone'):
            student.phone = data.get('phone')
        if data.get('date_of_birth'):
            try:
                student.date_of_birth = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid date format'
                }), 400
        if data.get('gender'):
            student.gender = data.get('gender')
        if data.get('address'):
            student.address = data.get('address')
        if data.get('city'):
            student.city = data.get('city')
        if data.get('state'):
            student.state = data.get('state')
        if data.get('zip_code'):
            student.zip_code = data.get('zip_code')
        if data.get('country'):
            student.country = data.get('country')
        if data.get('course'):
            student.course = data.get('course')
        if data.get('semester'):
            student.semester = data.get('semester')
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student updated successfully!',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Update failed: {str(e)}'
        }), 500

@app.route('/student/<int:id>', methods=['DELETE'])
def delete_student(id):
    try:
        student = Student.query.get_or_404(id)
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student deleted successfully!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_student: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Delete failed: {str(e)}'
        }), 500

# Error handler for 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Resource not found'
    }), 404

# Error handler for 500
@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(debug=True)
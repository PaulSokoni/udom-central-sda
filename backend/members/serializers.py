from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Member, Department, Group, Choir, UserRole


class DepartmentSerializer(serializers.ModelSerializer):
    leader_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_leader_name(self, obj):
        return obj.leader.full_name() if obj.leader else None

    def get_member_count(self, obj):
        return obj.members.count()


class GroupSerializer(serializers.ModelSerializer):
    leader_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = '__all__'

    def get_leader_name(self, obj):
        return obj.leader.full_name() if obj.leader else None

    def get_member_count(self, obj):
        return obj.members.count()


class ChoirSerializer(serializers.ModelSerializer):
    director_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Choir
        fields = '__all__'

    def get_director_name(self, obj):
        return obj.director.full_name() if obj.director else None

    def get_member_count(self, obj):
        return obj.members.count()


class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    gender_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    has_account = serializers.SerializerMethodField()
    account_username = serializers.SerializerMethodField()

    # Write-only fields for creating a login account
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ['member_id', 'created_at', 'updated_at', 'user']

    def get_full_name(self, obj):
        return obj.full_name()

    def get_age(self, obj):
        return obj.age()

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_gender_display(self, obj):
        return obj.get_gender_display()

    def get_status_display(self, obj):
        return obj.get_membership_status_display()

    def get_has_account(self, obj):
        return obj.user is not None

    def get_account_username(self, obj):
        return obj.user.username if obj.user else None

    def validate_date_of_birth(self, value):
        if value is None:
            return value
        from django.utils import timezone
        today = timezone.now().date()
        if value > today:
            raise serializers.ValidationError('Date of birth cannot be in the future.')
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age > 120:
            raise serializers.ValidationError('Please enter a valid date of birth (age cannot exceed 120 years).')
        return value

    def validate_baptism_date(self, value):
        if value is None:
            return value
        from django.utils import timezone
        today = timezone.now().date()
        if value > today:
            raise serializers.ValidationError('Baptism date cannot be in the future.')
        return value

    def validate_photo(self, value):
        if value:
            allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError('Only JPEG, PNG, WebP, or GIF images are allowed.')
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError('Photo must be smaller than 5 MB.')
        return value

    def validate(self, data):
        baptism_date = data.get('baptism_date') or getattr(self.instance, 'baptism_date', None)
        membership_date = data.get('membership_date') or getattr(self.instance, 'membership_date', None)
        if baptism_date and membership_date and membership_date < baptism_date:
            raise serializers.ValidationError(
                {'membership_date': 'Membership date cannot be before baptism date.'}
            )
        return data

    def validate_username(self, value):
        if value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def _validate_password(self, password, user=None):
        try:
            validate_password(password, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

    def create(self, validated_data):
        username = validated_data.pop('username', '').strip()
        password = validated_data.pop('password', '').strip()

        if username and password:
            self._validate_password(password)

        member = Member.objects.create(**validated_data)

        if username and password:
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=member.first_name,
                last_name=member.last_name,
                email=member.email or '',
            )
            member.user = user
            member.save()

        return member

    def update(self, instance, validated_data):
        username = validated_data.pop('username', '').strip()
        password = validated_data.pop('password', '').strip()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if username and password:
            self._validate_password(password, user=instance.user)
            if instance.user:
                # Update existing account
                instance.user.username = username
                instance.user.set_password(password)
                instance.user.save()
            else:
                # Create new account and link it
                user = User.objects.create_user(
                    username=username,
                    password=password,
                    first_name=instance.first_name,
                    last_name=instance.last_name,
                    email=instance.email or '',
                )
                instance.user = user
                instance.save()

        return instance


class MemberListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    gender_display = serializers.SerializerMethodField()
    has_account = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['id', 'member_id', 'full_name', 'first_name', 'last_name',
                  'gender', 'gender_display', 'phone', 'membership_status',
                  'status_display', 'department_name', 'membership_date',
                  'created_at', 'has_account']

    def get_full_name(self, obj):
        return obj.full_name()

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_status_display(self, obj):
        return obj.get_membership_status_display()

    def get_gender_display(self, obj):
        return obj.get_gender_display()

    def get_has_account(self, obj):
        return obj.user is not None


class UserRoleSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = UserRole
        fields = ['id', 'user_id', 'username', 'full_name', 'email', 'is_staff', 'role', 'role_display']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_role_display(self, obj):
        return obj.get_role_display()

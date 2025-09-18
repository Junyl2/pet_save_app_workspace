# AuthService Usage Examples

## Email Verification

### Send Email Verification Code

```typescript
import { AuthService } from '@/app/api/services/client/auth/authService';

const response = await AuthService.sendEmailVerification({
  name: 'John Doe',
  email: 'john@example.com',
});

if (response.error) {
  console.error('Failed to send verification:', response.error);
} else {
  console.log('Verification sent:', response.data);
}
```

### Verify Email Code

```typescript
const response = await AuthService.verifyEmailCode(
  'john@example.com',
  '123456'
);

if (response.error) {
  console.error('Verification failed:', response.error);
} else {
  console.log('Email verified:', response.data);
}
```

## Phone Verification

### Verify Phone Code

```typescript
const response = await AuthService.verifyPhoneCode('+1234567890', '123456');

if (response.error) {
  console.error('Phone verification failed:', response.error);
} else {
  console.log('Phone verified:', response.data);
}
```

## Generic Verify Code (Union Type)

```typescript
// For email verification
const emailResponse = await AuthService.verifyCode({
  email: 'john@example.com',
  code: '123456',
});

// For phone verification
const phoneResponse = await AuthService.verifyCode({
  phoneNumber: '+1234567890',
  code: '123456',
});
```

## User Login

### Login with credentials

```typescript
const response = await AuthService.loginWithCredentials(
  'johndoe', // identifier (username, email, or phone)
  'TestPass123!', // password
  'GENERAL' // loginType
);

if (response.error) {
  console.error('Login failed:', response.error);
} else {
  console.log('Login successful:', response.data);
  // Tokens are automatically stored in localStorage
}
```

### Login with login data object

```typescript
const loginData = {
  identifier: 'johndoe',
  password: 'TestPass123!',
  loginType: 'GENERAL',
};

const response = await AuthService.login(loginData);
```

## User Signup

```typescript
const signupData = {
  identifier: 'johndoe',
  password: 'TestPass123!',
  loginType: 'GENERAL',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  zipCode: '12345',
  roadAddress: '123 Main St',
  detailedAddress: 'Apt 1',
  name: 'John Doe',
  nickname: 'John',
  birthDate: '1990-01-01T00:00:00.000Z',
  referralCode: 'REF123',
};

const response = await AuthService.signupGeneral(signupData);
```

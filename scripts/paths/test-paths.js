// Test path escaping for different platforms
const windowsPath = 'C:\\Android';
const linuxPath = '/opt/android-sdk';
const macPath = '/Users/user/Library/Android/sdk';

console.log('Original paths:');
console.log('Windows:', windowsPath);
console.log('Linux:', linuxPath);
console.log('macOS:', macPath);

console.log('\nAfter escaping:');
console.log('Windows:', windowsPath.replace(/\\/g, '\\\\'));
console.log('Linux:', linuxPath.replace(/\\/g, '\\\\'));
console.log('macOS:', macPath.replace(/\\/g, '\\\\'));

// Test script to debug package name validation

function validatePackageName(packageName) {
  if (!packageName || typeof packageName !== 'string') {
    return { isValid: false, message: 'Package name is required' };
  }
  
  // Java package naming convention
  const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  
  if (!packageRegex.test(packageName)) {
    return { 
      isValid: false, 
      message: 'Package name must follow Java package naming conventions:\n' +
               '• Must start with a lowercase letter\n' +
               '• Can contain lowercase letters, numbers, and underscores\n' +
               '• Must have at least one dot (e.g., com.company.appname)\n' +
               '• Each part must start with a letter\n' +
               'Example: com.yourcompany.appname'
    };
  }
  
  // Check for reserved words and common mistakes
  const parts = packageName.split('.');
  const reservedPrefixes = ['com.android', 'com.google', 'java', 'javax'];
  const reservedWords = ['android', 'java', 'javax'];

  if (parts.length < 3) {
    return { isValid: false, message: 'Package name must have exactly 3 parts separated by dots (e.g., com.company.appname)' };
  }

  if (parts.length > 5) {
    return { isValid: false, message: 'Package name should not have more than 5 parts for simplicity' };
  }

  // Check for reserved prefixes (full package starts)
  for (const prefix of reservedPrefixes) {
    if (packageName.startsWith(prefix + '.') || packageName === prefix) {
      return { isValid: false, message: `Package name cannot start with reserved prefix: ${prefix}` };
    }
  }

  // Check for reserved words in individual parts (excluding common TLDs like 'com')
  for (const part of parts) {
    console.log(`Checking part: "${part}" against reserved words:`, reservedWords);
    if (reservedWords.includes(part)) {
      return { isValid: false, message: `Package name cannot use reserved word: ${part}` };
    }
  }

  return { isValid: true };
}

// Test cases
console.log('Testing "com.djkjdkj.djjdm":');
console.log(validatePackageName('com.djkjdkj.djjdm'));

console.log('\nTesting "com.android.test":');
console.log(validatePackageName('com.android.test'));

console.log('\nTesting "java.util.test":');
console.log(validatePackageName('java.util.test'));

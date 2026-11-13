#!/usr/bin/env python3
# بناء APK تفاعلياً عبر pexpect — يجيب عن أسئلة bubblewrap تلقائياً
import sys
import pexpect

PASS = 'Shasha2026!DZ'
CWD = '/home/z/my-project/apk'

child = pexpect.spawn(
    'bubblewrap', ['build'], cwd=CWD, encoding='utf-8',
    timeout=540, dimensions=(50, 200)
)
child.logfile_read = sys.stdout  # اطبع كل شيء حياً

# قواعد الإجابة: (نمط، إجابة)
rules = [
    (r'regenerate your project', 'Y'),
    (r'versionName[^:]*:', '1.0.0'),
    (r'versionCode[^:]*:', '1'),
    (r'[Pp]assword', PASS),
    (r'\(Y/n\)', 'Y'),
    (r'\(y/N\)', 'y'),
]

success_patterns = ['Build successful', 'app-release-signed', 'Signed APK', 'BUILD SUCCESSFUL']
patterns = [r[0] for r in rules] + success_patterns + [pexpect.EOF, pexpect.TIMEOUT]

while True:
    idx = child.expect(patterns)
    n_rules = len(rules)
    if idx < n_rules:
        child.sendline(rules[idx][1])
    elif idx < n_rules + len(success_patterns):
        print(f'\n>>> SUCCESS MARKER MATCHED (rule {idx})')
        # انتظر انتهاء العملية بهدوء
        try:
            child.expect([pexpect.EOF], timeout=120)
        except Exception:
            pass
        break
    elif idx == n_rules + len(success_patterns):
        print('\n>>> EOF (انتهت العملية)')
        break
    else:
        print('\n>>> TIMEOUT — آخر مخرجات غير معروفة، أرسل Enter وانتظر')
        child.sendline('')
        # محاولة واحدة إضافية فقط
        try:
            idx2 = child.expect(patterns, timeout=60)
            if idx2 < n_rules:
                child.sendline(rules[idx2][1])
            else:
                break
        except Exception:
            break

child.close()
print(f'EXIT STATUS: {child.exitstatus}')
sys.exit(0 if child.exitstatus == 0 else 1)

import type { Example } from '../types';

export const DEFAULT_CODE = `#include <stdio.h>

int main(void) {
    printf("你好，C Lab！\\n");
    printf("修改代码，然后按 ⌘ / Ctrl + Enter 运行。\\n");
    return 0;
}`;

export const EXAMPLES: Example[] = [
  {
    id: 'hello-c',
    title: '第一行 C 程序',
    summary: '认识 main 函数、printf 和返回值，让程序说出第一句话。',
    category: '第一步',
    minutes: 3,
    concepts: ['main', 'printf', 'stdio.h'],
    code: `#include <stdio.h>

int main(void) {
    printf("Hello, C!\\n");
    printf("每一行代码，都值得亲手运行。\\n");
    return 0;
}`,
  },
  {
    id: 'variables-input',
    title: '变量与标准输入',
    summary: '读取两个整数，观察 scanf 如何把输入交给变量。',
    category: '第一步',
    minutes: 5,
    concepts: ['int', 'scanf', '格式化输出'],
    stdin: '12 30\n',
    code: `#include <stdio.h>

int main(void) {
    int a = 0;
    int b = 0;

    printf("请输入两个整数：");
    if (scanf("%d %d", &a, &b) != 2) {
        printf("输入格式不正确\\n");
        return 1;
    }

    printf("%d + %d = %d\\n", a, b, a + b);
    return 0;
}`,
  },
  {
    id: 'leap-year',
    title: '条件分支：闰年',
    summary: '把自然语言规则拆成 if / else，理解条件组合的顺序。',
    category: '流程控制',
    minutes: 6,
    concepts: ['if', 'else', '逻辑运算'],
    stdin: '2028\n',
    code: `#include <stdio.h>

int main(void) {
    int year = 0;
    if (scanf("%d", &year) != 1) return 1;

    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        printf("%d 是闰年\\n", year);
    } else {
        printf("%d 不是闰年\\n", year);
    }
    return 0;
}`,
  },
  {
    id: 'loop-pattern',
    title: '循环：数字金字塔',
    summary: '用嵌套循环控制行与列，看清循环变量如何改变输出。',
    category: '流程控制',
    minutes: 7,
    concepts: ['for', '嵌套循环', '边界条件'],
    code: `#include <stdio.h>

int main(void) {
    const int rows = 5;

    for (int row = 1; row <= rows; ++row) {
        for (int number = 1; number <= row; ++number) {
            printf("%d ", number);
        }
        printf("\\n");
    }
    return 0;
}`,
  },
  {
    id: 'gcd-function',
    title: '函数：最大公约数',
    summary: '把独立逻辑收进函数，用辗转相除法求两个数的最大公约数。',
    category: '函数与数组',
    minutes: 8,
    concepts: ['函数', '参数', 'while'],
    stdin: '1071 462\n',
    code: `#include <stdio.h>

int gcd(int a, int b) {
    while (b != 0) {
        const int remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}

int main(void) {
    int a = 0;
    int b = 0;
    if (scanf("%d %d", &a, &b) != 2) return 1;

    printf("gcd(%d, %d) = %d\\n", a, b, gcd(a, b));
    return 0;
}`,
  },
  {
    id: 'array-max',
    title: '数组：寻找最大值',
    summary: '遍历数组并维护当前最大值，注意下标从 0 开始。',
    category: '函数与数组',
    minutes: 6,
    concepts: ['数组', '遍历', 'sizeof'],
    code: `#include <stdio.h>

int main(void) {
    const int values[] = {42, 17, 89, 23, 68};
    const int count = (int)(sizeof(values) / sizeof(values[0]));
    int maximum = values[0];

    for (int i = 1; i < count; ++i) {
        if (values[i] > maximum) maximum = values[i];
    }

    printf("数组中有 %d 个数，最大值是 %d\\n", count, maximum);
    return 0;
}`,
  },
  {
    id: 'pointer-swap',
    title: '指针：交换两个变量',
    summary: '通过地址修改调用者的变量，直观理解指针最经典的用途。',
    category: '指针与内存',
    minutes: 9,
    concepts: ['指针', '地址', '解引用'],
    code: `#include <stdio.h>

void swap(int *left, int *right) {
    const int temporary = *left;
    *left = *right;
    *right = temporary;
}

int main(void) {
    int a = 10;
    int b = 20;

    printf("交换前：a = %d, b = %d\\n", a, b);
    swap(&a, &b);
    printf("交换后：a = %d, b = %d\\n", a, b);
    return 0;
}`,
  },
  {
    id: 'struct-student',
    title: '结构体：组织相关数据',
    summary: '把姓名、学号和成绩放进一个类型，让数据结构更贴近问题。',
    category: '数据组织',
    minutes: 8,
    concepts: ['struct', 'typedef', '成员访问'],
    code: `#include <stdio.h>

typedef struct {
    char name[32];
    int id;
    double score;
} Student;

void print_student(const Student *student) {
    printf("%s（%d）的成绩是 %.1f\\n",
           student->name, student->id, student->score);
}

int main(void) {
    const Student student = {"Lin", 2026, 93.5};
    print_student(&student);
    return 0;
}`,
  },
  {
    id: 'dynamic-array',
    title: '动态内存：可变长数组',
    summary: '根据输入申请内存，并在使用结束后配对 free，建立内存责任意识。',
    category: '指针与内存',
    minutes: 12,
    concepts: ['malloc', 'free', '指针'],
    stdin: '5\n70 80 90 100 60\n',
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int count = 0;
    if (scanf("%d", &count) != 1 || count <= 0) return 1;

    int *values = malloc((size_t)count * sizeof(*values));
    if (values == NULL) {
        fprintf(stderr, "内存分配失败\\n");
        return 1;
    }

    long long sum = 0;
    for (int i = 0; i < count; ++i) {
        if (scanf("%d", &values[i]) != 1) {
            free(values);
            return 1;
        }
        sum += values[i];
    }

    printf("平均值：%.2f\\n", (double)sum / count);
    free(values);
    return 0;
}`,
  },
];

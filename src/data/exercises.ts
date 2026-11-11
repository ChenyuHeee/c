import type { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  {
    id: 'sum-two',
    title: '两数之和',
    summary: '从标准输入读取两个整数，输出它们的和。',
    category: '输入与输出',
    difficulty: '入门',
    concepts: ['scanf', 'printf', '整数'],
    task: ['输入包含两个整数 a 和 b。', '输出一个整数，即 a + b。', '不要输出提示文字或其他内容。'],
    starterCode: `#include <stdio.h>

int main(void) {
    int a = 0;
    int b = 0;
    if (scanf("%d %d", &a, &b) != 2) return 1;

    // 在这里输出答案

    return 0;
}`,
    tests: [
      { name: '正数相加', input: '2 3\n', expected: '5\n' },
      { name: '包含负数', input: '-8 3\n', expected: '-5\n' },
      { name: '包含零', input: '0 42\n', expected: '42\n' },
      { name: '较大整数', input: '1000000 2000000\n', expected: '3000000\n' },
    ],
    hints: ['printf 的格式说明符 %d 用于输出 int。', '只需要 printf("%d\\n", a + b);，不需要额外文字。'],
    solution: `#include <stdio.h>

int main(void) {
    int a = 0;
    int b = 0;
    if (scanf("%d %d", &a, &b) != 2) return 1;
    printf("%d\\n", a + b);
    return 0;
}`,
  },
  {
    id: 'max-three',
    title: '三个数中的最大值',
    summary: '使用条件判断，找到三个整数中的最大值。',
    category: '条件分支',
    difficulty: '入门',
    concepts: ['if', '比较', '分支'],
    task: ['输入三个整数 a、b、c。', '输出其中最大的整数。', '三个数相等时，输出这个数即可。'],
    starterCode: `#include <stdio.h>

int main(void) {
    int a = 0;
    int b = 0;
    int c = 0;
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 1;

    // 在这里计算并输出最大值

    return 0;
}`,
    tests: [
      { name: '第一个最大', input: '9 3 5\n', expected: '9\n' },
      { name: '第二个最大', input: '4 12 8\n', expected: '12\n' },
      { name: '第三个最大', input: '-9 -20 -3\n', expected: '-3\n' },
      { name: '全部相等', input: '7 7 7\n', expected: '7\n' },
    ],
    hints: ['可以先假设 a 最大，再依次与 b、c 比较。', '每次发现更大的数，就更新 maximum。'],
    solution: `#include <stdio.h>

int main(void) {
    int a = 0;
    int b = 0;
    int c = 0;
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 1;

    int maximum = a;
    if (b > maximum) maximum = b;
    if (c > maximum) maximum = c;
    printf("%d\\n", maximum);
    return 0;
}`,
  },
  {
    id: 'digit-sum',
    title: '数位之和',
    summary: '反复取余和整除，计算非负整数的各位数字之和。',
    category: '循环',
    difficulty: '基础',
    concepts: ['while', '取余', '整除'],
    task: ['输入一个非负整数 n（0 ≤ n ≤ 1,000,000,000）。', '输出 n 的十进制各位数字之和。', '注意 n = 0 时答案为 0。'],
    starterCode: `#include <stdio.h>

int main(void) {
    int n = 0;
    if (scanf("%d", &n) != 1 || n < 0) return 1;

    int sum = 0;
    // 在这里计算 sum
    printf("%d\\n", sum);
    return 0;
}`,
    tests: [
      { name: '常规整数', input: '1234\n', expected: '10\n' },
      { name: '包含零', input: '10020\n', expected: '3\n' },
      { name: '输入为零', input: '0\n', expected: '0\n' },
      { name: '单个数字', input: '9\n', expected: '9\n' },
    ],
    hints: ['n % 10 可以得到最后一位，n / 10 可以去掉最后一位。', 'sum 初始为 0，所以 n = 0 时无需进入循环，也能得到正确答案。'],
    solution: `#include <stdio.h>

int main(void) {
    int n = 0;
    if (scanf("%d", &n) != 1 || n < 0) return 1;

    int sum = 0;
    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    printf("%d\\n", sum);
    return 0;
}`,
  },
  {
    id: 'fizz-buzz',
    title: 'FizzBuzz',
    summary: '组合循环与多个条件，练习分支顺序。',
    category: '循环',
    difficulty: '基础',
    concepts: ['for', '取余', '分支顺序'],
    task: ['输入正整数 n。', '从 1 到 n 每行输出一项。', '3 的倍数输出 Fizz，5 的倍数输出 Buzz，同时是两者倍数输出 FizzBuzz，其他输出数字本身。'],
    starterCode: `#include <stdio.h>

int main(void) {
    int n = 0;
    if (scanf("%d", &n) != 1 || n <= 0) return 1;

    // 在这里输出 1 到 n 对应的结果
    return 0;
}`,
    tests: [
      { name: '前五项', input: '5\n', expected: '1\n2\nFizz\n4\nBuzz\n' },
      { name: '只有一项', input: '1\n', expected: '1\n' },
      { name: '同时整除', input: '15\n', expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n' },
    ],
    hints: ['先判断同时是 3 和 5 的倍数，否则它会被单独的 Fizz 或 Buzz 分支截获。', '可以使用 i % 15 == 0，也可以组合 i % 3 == 0 && i % 5 == 0。'],
    solution: `#include <stdio.h>

int main(void) {
    int n = 0;
    if (scanf("%d", &n) != 1 || n <= 0) return 1;

    for (int i = 1; i <= n; ++i) {
        if (i % 15 == 0) printf("FizzBuzz\\n");
        else if (i % 3 == 0) printf("Fizz\\n");
        else if (i % 5 == 0) printf("Buzz\\n");
        else printf("%d\\n", i);
    }
    return 0;
}`,
  },
  {
    id: 'reverse-string',
    title: '反转字符串',
    summary: '使用两个下标交换字符，原地反转一个单词。',
    category: '数组与字符串',
    difficulty: '基础',
    concepts: ['字符数组', '双指针', 'strlen'],
    task: ['输入一个不含空格、长度不超过 100 的字符串。', '将其字符顺序反转后输出。', '不要新增一个相同长度的辅助数组。'],
    starterCode: `#include <stdio.h>
#include <string.h>

int main(void) {
    char text[101];
    if (scanf("%100s", text) != 1) return 1;

    // 在这里原地反转 text
    printf("%s\\n", text);
    return 0;
}`,
    tests: [
      { name: '普通单词', input: 'hello\n', expected: 'olleh\n' },
      { name: '单字符', input: 'C\n', expected: 'C\n' },
      { name: '回文字符串', input: 'level\n', expected: 'level\n' },
      { name: '数字与字母', input: 'abc123\n', expected: '321cba\n' },
    ],
    hints: ['左下标从 0 开始，右下标从 strlen(text) - 1 开始。', '当 left < right 时交换两个字符，然后让两个下标向中间移动。'],
    solution: `#include <stdio.h>
#include <string.h>

int main(void) {
    char text[101];
    if (scanf("%100s", text) != 1) return 1;

    size_t left = 0;
    size_t right = strlen(text);
    while (right > 0 && left < right - 1) {
        const char temporary = text[left];
        text[left] = text[right - 1];
        text[right - 1] = temporary;
        ++left;
        --right;
    }
    printf("%s\\n", text);
    return 0;
}`,
  },
  {
    id: 'bubble-sort',
    title: '冒泡排序',
    summary: '比较并交换相邻元素，将一组整数按升序排列。',
    category: '数组与字符串',
    difficulty: '进阶',
    concepts: ['数组', '嵌套循环', '交换'],
    task: ['第一行输入整数 n（1 ≤ n ≤ 100），第二行输入 n 个整数。', '按从小到大排序，并用一个空格分隔相邻数字。', '行末不要输出额外空格。'],
    starterCode: `#include <stdio.h>

int main(void) {
    int values[100];
    int n = 0;
    if (scanf("%d", &n) != 1 || n < 1 || n > 100) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%d", &values[i]) != 1) return 1;
    }

    // 在这里排序并输出 values
    return 0;
}`,
    tests: [
      { name: '乱序数组', input: '5\n3 1 4 1 5\n', expected: '1 1 3 4 5\n' },
      { name: '已经有序', input: '4\n1 2 3 4\n', expected: '1 2 3 4\n' },
      { name: '逆序与负数', input: '5\n5 3 -1 0 -8\n', expected: '-8 -1 0 3 5\n' },
      { name: '单个元素', input: '1\n42\n', expected: '42\n' },
    ],
    hints: ['每一轮把当前未排序部分的最大值移动到右侧。', '输出时用 if (i > 0) printf(" "); 避免末尾空格。'],
    solution: `#include <stdio.h>

int main(void) {
    int values[100];
    int n = 0;
    if (scanf("%d", &n) != 1 || n < 1 || n > 100) return 1;
    for (int i = 0; i < n; ++i) {
        if (scanf("%d", &values[i]) != 1) return 1;
    }

    for (int end = n - 1; end > 0; --end) {
        for (int i = 0; i < end; ++i) {
            if (values[i] > values[i + 1]) {
                const int temporary = values[i];
                values[i] = values[i + 1];
                values[i + 1] = temporary;
            }
        }
    }

    for (int i = 0; i < n; ++i) {
        if (i > 0) printf(" ");
        printf("%d", values[i]);
    }
    printf("\\n");
    return 0;
}`,
  },
];

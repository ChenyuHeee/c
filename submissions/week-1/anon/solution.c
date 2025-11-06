#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    // 上半部分（包括中间行）
    for (int i = 1; i <= n; i += 2) {
        // 打印前导空格
        for (int j = 0; j < (n - i) / 2; j++) {
            printf(" ");
        }
        // 打印星号
        for (int j = 0; j < i; j++) {
            printf("*");
        }
        printf("\n");
    }
    
    // 下半部分
    for (int i = n - 2; i >= 1; i -= 2) {
        // 打印前导空格
        for (int j = 0; j < (n - i) / 2; j++) {
            printf(" ");
        }
        // 打印星号
        for (int j = 0; j < i; j++) {
            printf("*");
        }
        printf("\n");
    }
    
    return 0;
}

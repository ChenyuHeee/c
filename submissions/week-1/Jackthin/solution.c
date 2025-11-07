#include <stdio.h>

int main(){
    int n;
    printf("n=");
    scanf("%d",&n);
    for(int i=1;i<=n;i++){
        for(int j=1;j<=n-i;j++) putchar(' ');
        for(int j=1;j<=i*2-1;j++) putchar('*');
        putchar('\n');
    }
    for(int i=n-1;i>=1;i--){
        for(int j=1;j<=n-i;j++) putchar(' ');
        for(int j=1;j<=i*2-1;j++) putchar('*');
        putchar('\n');
    }
    return 0;
}

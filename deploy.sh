#!/bin/sh

#读取输入参数

argc=$#;

if [ -z "$1" ]; then
    echo "需要包含一个参数";
    exit;
fi

#检查ip地址，返回1表示错误的ip，0表示正确的ip
testIp(){
    testIp=$(echo $1 | grep -E '^[a-zA-Z]+@((2(5[0-5]{1}|[0-4][0-9]{1}))|([0-1]?[0-9]{1,2}))\.((2(5[0-5]{1}|[0-4][0-9]{1}))|([0-1]?[0-9]{1,2}))\.((2(5[0-5]{1}|[0-4][0-9]{1}))|([0-1]?[0-9]{1,2}))\.((2(5[0-5]{1}|[0-4][0-9]{1}))|([0-1]?[0-9]{1,2}))$');

    if [ -z "$testIp" ]; then
        return 1;
    else
        return 0;
    fi
}

testIp $1;

#使用$?获取返回值
if [ $? -eq 1 ]; then
    echo "参数必须是username@ip地址";
    exit;
fi

deployIp=$1;

echo $deployIp

excludes=("./node_modules" "./package-lock.json")


inArray(){
    c=0
    for e in ${@}
    do
        if [ "${e}" == "$1" ]; then
            c=$(($c+1))
        fi
    done
    if [ $c -ge 2 ]; then
        return 1
    else
        return 0
    fi
}

cpto=../tmp/minigame
cpToTmp(){
    #删除tmp
    if [ -e ${cpto} ]; then
        rm -rf ${cpto};
    fi
    #创建tmp
    mkdir -p ${cpto};

    for f in ./*
    do
        inArray "${f}" ${excludes[@]}
        if [ $? -ne 1 ]; then
            if [ -f ${f} ]; then
                cp $f ${cpto}
            else
                cp -r $f ${cpto}
            fi
        else
            echo "${f} need exclude"
        fi
    done
}

echo copy当前目录文件到${cpto}目录下
cpToTmp
echo copy完成，准备执行scp命令

scp -r $cpto $deployIp:~/

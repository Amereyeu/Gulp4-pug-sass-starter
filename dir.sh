#!/bin/bash

echo "*----------------------------------*"
echo "*-- Creating directory structure --*"
echo "*----------------------------------*"

cat folder_list.txt | xargs mkdir

echo "|"
echo "|"
echo "|"
echo "*----------------------------------*"
echo "*-- Directory structure created ---*"
echo "*----------------------------------*"
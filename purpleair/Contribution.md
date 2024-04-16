# Welcome! to Contribution Guide to codappurpleairplugin <!-- omit in toc -->

Welcome to the contribution page for codappurpleairplugin. In this guide you will get an overview on how to contribute to 
codappurpleairplugin project if you're on Mac or on Windows and how to create a PR request. 

## Some useful Links <!-- omit in toc -->

- The overview of the project is loacted in [README.md](https://github.com/Shubhangi0308/codappurpleairplugin#readme).
- [Link](https://drive.google.com/drive/u/0/folders/1gMZHDTfpOw7a9Ug0HqsD2LNzi8lKEDoD) to all CODAP plugin files.
- To run this project, you need to start the local server on your system. 

## How to Contribute, if you're on Mac <!-- omit in toc -->

1. The first thing is to create a an empty folder with any name either on your Desktop or any location which is preferable to you. 
2. After creating a folder, download the [CODAP Plugin files](https://drive.google.com/drive/u/0/folders/1gMZHDTfpOw7a9Ug0HqsD2LNzi8lKEDoD). As there are two files "**codap**" and "**codapPlugins**", download both of them into the new folder that you've created. 
3. After this, download the code from the [GITHUB Page](https://github.com/vverma9/codappurpleairplugin). 
   * Click on the GITHUB Page link. Once you are on the Github repository, click on "**Code**" and then click on "**Download Zip**". As it is Mac, so while downloading it won't create a zip, it will be downloaded as a folder so no need to unzip. Still if it's zipped, unzip the file.
   * After unzipping, rename the file to "**codappurpleairplugin**". 
   * Place this unzipped folder to the new folder that you created where your CODAP plugin files resides. After moving into the new folder you will see three folders *i.e.* "**codap**", "**codapPlugins**" and "**codappurpleairplugin**". 
   * Now move "**codappurpleairplugin**" folder inside "**codapPlugins**", so that it is connected with the CODAP plugins. 
 4. After performing all these steps, you need to start making our desired changes to the file into the "**codappurpleairplugin**" folder. Make sure to be very careful before making changes. 
 5. After the changes are made, you need to start the localhost server on Mac, to do so follow the below steps. 

#### Starting Localhost on Mac

1. Open the Terminal on Mac.
2. Type the below commands. 
   - cd ~/Desktop/*folder_name*. Include your own folder_name where you stored the "**codap**" and "**codapPlugins**" files. For example, if you created a folder named "my-project" on your Desktop to store the CODAP and CODAP Plugins files, the command would be "cd ~/Desktop/my-project". If you created in Downloads or any where in Users then give that name. 
   - python3 -m http.server 8080.
     -  It is not mandatory to take port 8080. It might be possible that port 8080 can be occupied by other processes. So if 8080 does not work try to take other ports as 80.
3. Once you paste those two commands. You will see something like this "Serving HTTP on :: port 8080 (http://[::]:8080/) ..." which means that local server has started. 
4. Once local server has started, go to your browser either Chrome or Safari and paste the Link http://localhost:8080/~*Directory_name*/*folder_name*/codap/static/dg/en/cert/index.html?di=http://localhost:8080/~*Directory_name*/*folder_name*/codapPlugins/codappurpleairplugin/index.html . You need to modify based on your specifications. 
   -  If you took other port number instead of 8080 give your port number.
   -  If you saved your folder in some other directory instead of "Desktop", replace "Desktop" with that name. 
      -  Once you are done replacing the name just remove "~" in front of Directory name as it is just to show that you need to make changes in this part of the link. 
   -  If you have a different name of your folder, then in place of "oss" give your folder name. 
   -  Here is tye example of link. http://localhost:8080/Desktop/oss/codap/static/dg/en/cert/index.html?di=http://localhost:8080/Desktop/oss/codapPlugins/codappurpleairplugin/index.html
4. Once you paste link in your browser, it will open a page like below. So whatever changes you might have made will be visible. 
<img width="1137" alt="Screenshot 2023-04-21 at 11 01 31 PM" src="https://user-images.githubusercontent.com/123619700/233765826-8372cedd-20bc-44f8-85ad-989ac0bf7b92.png">
5. Once you have made the changes. Close the terminal and terminate the session so that it stops the local server. 

### *Note* 
   - If you want to make some more changes, make sure you terminate the server everytime before making the changes and then start the server again by "python3 -m http.server 8080" command so that you can see your changes. If you don't terminate the server before making changes and you just try to refresh your browser page to see your changes, it won't be visible. So terminate the server, make changes and again start the server. 


## How to Contribute, if you're on Windows <!-- omit in toc -->


1.	Create a new folder with any name you prefer on your desktop or in any location that is convenient for you.
2.	Download the [CODAP Plugin files](https://drive.google.com/drive/u/0/folders/1gMZHDTfpOw7a9Ug0HqsD2LNzi8lKEDoD). There are two files you need to download:             "**codap**" and "**codapPlugins**". Save both files into the new folder you created.
3.	Download the code from the GitHub page: 
    - Click on the [GITHUB Page](https://github.com/vverma9/codappurpleairplugin) link for the project. 
    - Once you're on the GitHub repository page, click on the "**Code**" button and then click on "**Download ZIP**". 
    - Once the ZIP file is downloaded, extract its contents into the new folder you created. 
    - Rename the extracted folder to "**codappurpleairplugin**". 
    - Move the "**codappurpleairplugin**" folder into the "**codapPlugins**" folder so that it is connected with the CODAP plugins. Once this is done, you should see         three folders in your new folder: "**codap**", "**codapPlugins**", and "**codappurpleairplugin**".
4. Make the desired changes to the files inside the "codappurpleairplugin" folder, being careful not to accidentally delete or modify anything important.
5. #### Start a local server on your Windows machine by following these steps: 
    - Open the Command Prompt by typing "cmd" in the Windows search bar and clicking on "Command Prompt". 
    - Navigate to the directory where you saved your new folder using the "cd" command. For example, if your new folder is on your desktop and named "my-project", you       would type: cd C:\Users\YourUserName\Desktop\my-project 
    - Once you're in the correct directory, type the command "python -m http.server 8080" to start the local server. This will serve the files in the current directory       on port 8080. You will see a message in the Command Prompt indicating that the local server has started ("Serving HTTP on :: port 8080 (http://[::]:8080/)             ..."). 
    - Once the local server is running, open your web browser (such as Chrome or Firefox) and go to the following URL:                                          http://localhost:8080/*FOLDER_NAME*/codap/static/dg/en/cert/index.html?di=http://localhost:8080/*FOLDER_NAME*/codapPlugins/codappurpleairplugin/index.html
   
        * Replace FOLDER_NAME with the name of the folder you created earlier.
        * If you used a different port number, replace "8080" with that number in the URL. e. The web page that loads should display the changes you made to the files           in the "codappurpleairplugin" folder.
6. Once you're done making changes, close the Command Prompt and terminate the local server by pressing "Ctrl + C" in the Command Prompt window.
7. If you want to make additional changes, be sure to terminate the local server before making changes and start the server again afterwards. Otherwise, your changes may not be visible in the browser.

### *Note* 
* If you encounter any issues during the process, try restarting the local server or checking that you followed each step correctly. If the problem persists, seek help from the project's documentation or support resources.




## How to create a PR <!-- omit in toc -->

1. Once you're final with your changes, just fork the main repository from [HERE](https://github.com/vverma9/codappurpleairplugin) into your github account. 
2. Make all those changes again on your Github. Or you can even make changes locally by downloading the code, making changes locally, commiting all the changes and pushing the code back to your github repository. 
3. Once the changes are committed, create a pull request from the base repository *i.e* from where you have forked.
4. View all your changes, if all good create the pull request. 




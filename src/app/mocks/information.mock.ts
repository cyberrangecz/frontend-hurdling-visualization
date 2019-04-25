export const GAME_INFORMATION = {
    'id': 4,
    'title': 'CTF-1: No Secure Connection',
    'description': 'Training definition - securing connection',
    'prerequisities': null,
    'outcomes': null,
    'state': 'RELEASED',
    'authors': [],
    'beta_testing_group': {
        'id': 4,
        'organizers': []
    },
    'sandbox_definition_ref_id': 1,
    'starting_level': 32,
    'levels': [
        {
            'id': 32,
            'title': 'Base info for No Secure Connection',
            'max_score': 0,
            'next_level': 10,
            'snapshot_hook': null,
            'level_type': 'INFO_LEVEL',
            'estimated_duration': 0,
            'content': ''
        },
        {
            'id': 10,
            'title': 'Network Error - Info',
            'max_score': 0,
            'next_level': 11,
            'snapshot_hook': null,
            'level_type': 'INFO_LEVEL',
            'estimated_duration': 0,
            'content': ''
        },
        {
            'id': 11,
            'title': 'Network Error',
            'max_score': 20,
            'next_level': 12,
            'snapshot_hook': null,
            'level_type': 'GAME_LEVEL',
            'estimated_duration': 5,
            'flag': 'NoMoreTelnet',
            'content': '',
            'solution': 'NoMoreTelnet',
            'solution_penalized': true,
            'attachments': null,
            'hints': [
                {
                    'id': 3,
                    'title': 'Hint1',
                    'content': '',
                    'hint_penalty': 10
                }
            ],
            'incorrect_flag_limit': 5
        },
        {
            'id': 12,
            'title': 'New Secure Connection - Info',
            'max_score': 0,
            'next_level': 13,
            'snapshot_hook': null,
            'level_type': 'INFO_LEVEL',
            'estimated_duration': 0,
            'content': ''
        },
        {
            'id': 13,
            'title': 'New Secure Connection',
            'max_score': 20,
            'next_level': 14,
            'snapshot_hook': null,
            'level_type': 'GAME_LEVEL',
            'estimated_duration': 5,
            'flag': 'SetAndSafe',
            'content': '',
            'solution': 'SetAndSafe',
            'solution_penalized': true,
            'attachments': null,
            'hints': [
                {
                    'id': 4,
                    'title': 'Hint1',
                    'content': '',
                    'hint_penalty': 10
                }
            ],
            'incorrect_flag_limit': 5
        },
        {
            'id': 14,
            'title': 'Unavailable Document - Info',
            'max_score': 0,
            'next_level': 15,
            'snapshot_hook': null,
            'level_type': 'INFO_LEVEL',
            'estimated_duration': 0,
            'content': ''
        },
        {
            'id': 15,
            'title': 'Unavailable Document',
            'max_score': 35,
            'next_level': 16,
            'snapshot_hook': null,
            'level_type': 'GAME_LEVEL',
            'estimated_duration': 15,
            'flag': 'WhatAHacker',
            'content': '',
            'solution': 'WhatAHacker',
            'solution_penalized': true,
            'attachments': null,
            'hints': [
                {
                    'id': 5,
                    'title': 'Hint1',
                    'content': '',
                    'hint_penalty': 15
                },
                {
                    'id': 6,
                    'title': 'Hint2',
                    'content': '',
                    'hint_penalty': 5
                }
            ],
            'incorrect_flag_limit': 5
        },
        {
            'id': 16,
            'title': 'Disable Passwords - Info',
            'max_score': 0,
            'next_level': 17,
            'snapshot_hook': null,
            'level_type': 'INFO_LEVEL',
            'estimated_duration': 0,
            'content': ''
        },
        {
            'id': 17,
            'title': 'Disable Passwords',
            'max_score': 25,
            'next_level': null,
            'snapshot_hook': null,
            'level_type': 'GAME_LEVEL',
            'estimated_duration': 15,
            'flag': 'SSHKeys',
            'content': '',
            'solution': 'SSHKeys',
            'solution_penalized': true,
            'attachments': null,
            'hints': [
                {
                    'id': 7,
                    'title': 'Hint1',
                    'content': '',
                    'hint_penalty': 10
                }
            ],
            'incorrect_flag_limit': 5
        }
    ],
    'show_stepper_bar': true,
    'can_be_archived': false,
    'estimated_duration': 0,
    'last_edited': null
};

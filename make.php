<?php

/**
 * Makefile script to generate bundled koncerto.php
 */

if (!is_dir('dist')) {
    mkdir('dist');
}

$output = './dist/impulsus.js';
file_put_contents($output, <<<js
/**
 * Koncerto Impulsus Framework
 */


js);

$files = scandir('./src/');

foreach ($files as $file) {
    if ('.js' === strrchr($file, '.')) {
        $php = (string)file_get_contents('./src/' . $file);
        file_put_contents($output, $php, FILE_APPEND);
    }
}

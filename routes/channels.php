<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('asd', function () {
    return true;
});

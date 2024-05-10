import express from 'express';
import 'dotenv/config';
import connectToDb from './models/connection';
import { initializeBot } from './services/bot';

function init() {
    connectToDb();
    initializeBot();
}

init();

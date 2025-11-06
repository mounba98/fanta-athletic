#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script per aggiungere navbar a tutti i file HTML mancanti
"""

import os
import re

# File da processare (24 file senza navbar)
FILES_TO_FIX = [
    'admin-setup.html',
    'admin-debug.html',
    'admin-cup.html',
    'admin-import-players.html',
    'admin-organized.html',
    'upload-foto-giocatori.html',
    'verifica-squadre-utenti.html',
    'sblocca-formazioni-temp.html',
    'join-team.html',
    'athletic-manager.html',
    'athletic-cards-battle.html',
    'clash-cards.html',
    'wirc-batch-card-maker.html',
    'user-profile-upload.html',
    'upload-rules-to-firestore.html',
    # Debug/fix files (opzionali)
    'FIX_MAURO_PLAYER.html',
    'RESET_CURVA_FIX.html',
    'add-invite-code-to-leagues.html',
    'check-duplicate-rules.html',
    'debug-foto-db.html',
    'debug-join-code.html',
    'debug-league-structure.html',
    'fix-mark-g1-computed.html',
    'fix-users-leagues.html',
]

NAVBAR_CONTAINER = '  <div id="navbar-container"></div>\n'
NAVBAR_SCRIPT = '  <script src="resources/navbar.js?v=2025101901"></script>\n'

def add_navbar_to_file(filepath):
    """Aggiunge navbar a un singolo file HTML"""
    if not os.path.exists(filepath):
        print(f"⚠️  File non trovato: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check se ha già navbar
        if 'navbar-container' in content or 'navbar.js' in content:
            print(f"✅ {os.path.basename(filepath)} - già presente")
            return True
        
        # Aggiungi container dopo <body>
        if '<body>' in content:
            content = content.replace('<body>', '<body>\n' + NAVBAR_CONTAINER, 1)
        elif '<body' in content:
            # Caso <body class="...">
            content = re.sub(r'(<body[^>]*>)', r'\1\n' + NAVBAR_CONTAINER, content, count=1)
        else:
            print(f"❌ {os.path.basename(filepath)} - tag <body> non trovato")
            return False
        
        # Aggiungi script prima di altri script o prima di </body>
        if '<script' in content:
            # Trova primo script e inserisci prima
            content = re.sub(r'(\s*<script)', '\n' + NAVBAR_SCRIPT + r'\1', content, count=1)
        elif '</body>' in content:
            # Inserisci prima di </body>
            content = content.replace('</body>', '\n' + NAVBAR_SCRIPT + '</body>', 1)
        else:
            print(f"⚠️  {os.path.basename(filepath)} - nessun punto inserimento script trovato")
            # Aggiungi comunque alla fine
            content += '\n' + NAVBAR_SCRIPT
        
        # Salva file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ {os.path.basename(filepath)} - navbar aggiunta")
        return True
        
    except Exception as e:
        print(f"❌ {os.path.basename(filepath)} - errore: {e}")
        return False

def main():
    print("=" * 50)
    print("AGGIUNTA NAVBAR A TUTTI I FILE HTML")
    print("=" * 50)
    print()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    for filename in FILES_TO_FIX:
        filepath = os.path.join(base_dir, filename)
        result = add_navbar_to_file(filepath)
        
        if result is True:
            success_count += 1
        elif result is False:
            fail_count += 1
        else:
            skip_count += 1
    
    print()
    print("=" * 50)
    print(f"✅ Successo: {success_count}")
    print(f"⚠️  Skip: {skip_count}")
    print(f"❌ Falliti: {fail_count}")
    print("=" * 50)

if __name__ == '__main__':
    main()

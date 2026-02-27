const db = require('../../shared/config/db');

// Salvar bug report
exports.saveBugReport = async (data) => {
    const { message, page, user_agent, username } = data;
    
    await db.execute(
        'INSERT INTO bug_reports (message, page, user_agent, username, created_at) VALUES (?, ?, ?, ?, NOW())',
        [message, page || '/', user_agent || 'unknown', username || 'guest']
    );
    
    return { success: true };
};
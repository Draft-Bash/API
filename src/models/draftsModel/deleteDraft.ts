const db = require("../../db");

export async function deleteDraft(draftId: number) 
{
    const isDraftStarted = await db.query(`
            SELECT is_started FROM draft WHERE draft_id = $1 AND is_started = TRUE;`, [
            draftId
        ]);

    if (isDraftStarted.rows.length>0) {
        return false
    }
    else {
        await db.query(`
            DELETE FROM draft_user WHERE draft_id = $1;`, [
            draftId
        ]);
        await db.query(`
            DELETE FROM draft WHERE draft_id = $1;`, [
            draftId
        ]);
        return true
    }
}
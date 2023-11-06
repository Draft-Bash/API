export class FantasyPointConverter {
    protected rebWeight: number;
    protected ptWeight: number;
    protected blkWeight: number;
    protected stlWeight: number;
    protected turnoverWeight: number;
    protected assistWeight: number;

    constructor(rebWeight: number, ptWeight: number, blkWeight: number,
        stlWeight: number, turnoverWeight: number, assistWeight: number) {
        this.rebWeight = rebWeight;
        this.ptWeight = ptWeight;
        this.blkWeight = blkWeight;
        this.stlWeight = stlWeight;
        this.turnoverWeight = turnoverWeight;
        this.assistWeight = assistWeight;
    }

    public convert(rbs: number, pts: number, blks: number, stls: number, turnovers: number, assists: number) {
        const fanPts = (this.rebWeight*rbs)+(this.ptWeight*pts)+(this.stlWeight*stls)+
                        (this.blkWeight*blks)+(this.stlWeight*stls)+
                        (this.turnoverWeight*turnovers)+(this.assistWeight*assists);
        return fanPts;
    }
}
export type Stage = 'loading' | 'gate' | 'invite'

export const useStage = () => {
    const stage = useState<Stage>('stage', () => 'loading')
    return { stage }
}
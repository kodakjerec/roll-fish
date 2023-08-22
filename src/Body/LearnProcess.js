import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';

const MainDiv = styled.div`
display: flex;
`;

const PlanTitle = styled.h1`
    text-align: center;
`;

const FlexBase = styled.div`
    display: flex;
    align-items: flex-start;
`;

const FlexAround = styled(FlexBase)`
    position: relative;
    flex-flow: column;
    right: 0;
`;

const WordLine = styled.div`
    margin-bottom: 12px;
`;

const PhraseBase = styled(FlexBase)`
    flex-flow: column;
`;

const FlexCenter = styled(FlexBase)`
    justify-content: center;
`;

const WordCard = styled.div`
    position: relative;
    font-size: 1rem;
    flex-grow:2;
`;

const WordPosition = styled.div`
    margin-right: 12px;
`;

const Tag = styled.div`
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    margin-right: 6px;
    min-width: 50px;
    text-align: center;

    ${({ theme }) => {
        // console.log(theme);
        return {
            // backgroundColor: theme.palette.grey[300],
            color: theme.palette.info.contrastText,
            backgroundColor: theme.palette.info[theme.palette.mode],
        }
    }}
`;

const TestTag = styled(Tag)`
    text-align: left;
    font-size: 18px;
`;

const VoiceTag = styled(Tag)`
    cursor: pointer;
    text-decoration: underline;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        ${({ theme }) => {
        return {
            backgroundColor: theme.palette.grey[400],
        }
    }}
    }
`;

const FlexBasePhone = styled(FlexBase)`
    display: block;
    margin-bottom: 0px;
`;

const RightButton = styled(Button)`
    min-height: 10vh;
    padding-left: 2px;
    padding-right: 2px;
`;
const ReverseButton = styled(Button)`
    padding: 0px;
`;

const PageIndex = styled.div`
    position:absolute;
`;

const LearnProcess = ({ handleExec, handleEnd, learnCount, learnBook }) => {
    const [isReverse, setIsReverse] = useState(false);
    const [words, setWords] = useState([]);
    const queryRef = useRef(false);
    const [processIdx, setProcessIdx] = useState(0);
    const [testWords, setTestWords] = useState([]);
    const [testRecord, setTestRecord] = useState({});
    const [showTestRes, setShowTestRes] = useState(false);

    useEffect(() => {
        if (!queryRef.current) {
            queryRef.current = true;
            handleExec(`SELECT * from ${learnBook} WHERE status = 0 ORDER BY RANDOM() LIMIT 0,${learnCount}`, undefined, (result) => {
                try {
                    const { columns, values } = result[0];
                    const words = [];
                    // console.log(result, values);
                    for (let i = 0; i < values.length; i++) {
                        const line = values[i];
                        const word = {};
                        for (let j = 0; j < line.length; j++) {
                            const val = line[j];
                            word[columns[j]] = val;
                        }
                        words.push(word);
                    }
                    setWords(words);
                } catch (e) {
                    console.log(`Parse Query Result Error`, e);
                }
            });
        }
    }, []);

    const handleVoice = useCallback((word, type) => {
        const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${word}&type=${type}`);
        audio.play();
    }, []);

    const handleVoiceUK = useCallback(_.throttle((...args) => {
        handleVoice(...args)
    }, 1000), []);

    const handleVoiceUS = useCallback(_.throttle((...args) => {
        handleVoice(...args)
    }, 1000), []);

    const synth = window.speechSynthesis;
    const handleUScontent = useCallback((content, lang) => {
        if (!content) return;

        if (synth.speaking) {
            synth.cancel();
        }
        let msgSetting = new SpeechSynthesisUtterance();
        msgSetting.lang = lang ?? "en-US";
        msgSetting.text = content;
        synth.speak(msgSetting);
    });

    const handleChangeTest = useCallback((wd, value) => {
        setTestRecord(old => {
            return {
                ...old,
                [wd]: value,
            };
        });
    }, []);

    const handleStartTest = useCallback(_.throttle(() => {
        // console.log(words)

        handleExec(`SELECT * from ${learnBook} WHERE headWord NOT IN (${_.map(words, v => `'${v.headWord}'`).join(',')}) ORDER BY RANDOM() LIMIT 0,${learnCount * 2}`, undefined, (result) => {
            try {
                const { columns, values } = result[0];
                const _words = [];
                for (let i = 0; i < values.length; i++) {
                    const line = values[i];
                    const word = {};
                    for (let j = 0; j < line.length; j++) {
                        const val = line[j];
                        word[columns[j]] = val;
                    }
                    _words.push(word);
                }
                const _testWords = [];
                _.each(words, (wd, i) => {
                    _testWords.push(_.shuffle([
                        wd.tranCN,
                        _words[i].tranCN,
                        _words[i + learnCount].tranCN,
                    ]));
                });
                setTestWords(_testWords);
            } catch (e) {
                console.log(`Parse Query Result Error`, e);
            }
        });
    }, 1000), [words]);

    const handleEndTest = () => {
        // console.log(testRecord, words);
        const pass = [];
        _.each(words, (wd) => {
            if (wd.tranCN === testRecord[wd.headWord]) {
                pass.push(`"${wd.headWord}"`);
            }
        });

        // console.log(testRecord,pass);
        if (pass.length) {
            handleExec(`UPDATE ${learnBook} set status=1 WHERE headWord IN (${pass.join(',')})`, undefined, (result) => {
                console.log(result);
            });
        }
        setShowTestRes(true);
    };

    // console.log(words);
    if (words.length < 1) {
        return (
            <WordCard>
                <FlexCenter>
                    <PlanTitle>這本書已經沒有單字可學了</PlanTitle>
                </FlexCenter>
                <FlexCenter>
                    <Button onClick={handleEnd} variant="contained">去學習其他的吧</Button>
                </FlexCenter>
            </WordCard>
        );
    }


    if (testWords.length > 0) {
        return (
            <WordCard>
                <FlexCenter>
                    <PlanTitle>學習檢測</PlanTitle>
                </FlexCenter>
                <FlexCenter><WordLine>請選擇正確解釋</WordLine></FlexCenter>
                <div>
                    {_.map(words, (wd, i) => {
                        const error = !(wd.tranCN === testRecord[wd.headWord]);

                        return (
                            <WordLine key={wd.headWord}>
                                <TestTag>{i + 1}) {wd.headWord}</TestTag>
                                <FormControl component="fieldset" error={showTestRes ? error : undefined}>
                                    <RadioGroup aria-label="請選擇正確解釋" name={wd.headWord} value={testRecord[wd.headWord] || ''} onChange={(event) => handleChangeTest(wd.headWord, event.target.value)}>
                                        {_.map(testWords[i], (v) => {
                                            return <FormControlLabel key={v} disabled={showTestRes && testRecord[wd.headWord] !== v} value={v} control={<Radio color={showTestRes ? (error ? 'error' : 'success') : undefined} />} label={v} />
                                        })}
                                    </RadioGroup>
                                    {(showTestRes && error) ? (
                                        <FormHelperText>正確答案：{wd.tranCN}</FormHelperText>
                                    ) : null}
                                </FormControl>
                            </WordLine>
                        );
                    })}
                </div>
                <FlexCenter>
                    {showTestRes ? (
                        <Button onClick={handleEnd} variant="contained">再來一輪！</Button>
                    ) : (
                        <Button onClick={handleEndTest} variant="contained">交卷</Button>
                    )}
                </FlexCenter>
            </WordCard>
        );
    }

    // console.log(words);
    const currentWord = words[processIdx];

    return (
        <MainDiv style={{ flexDirection: isReverse ? 'row-reverse' : 'row' }}>
            <PageIndex>{processIdx}</PageIndex>
            <WordCard>
                <FlexCenter>
                    <PlanTitle>{currentWord.headWord}</PlanTitle>
                </FlexCenter>
                <WordLine>
                    <FlexBasePhone>
                        <div style={{ display: "flex", marginBottom: "12px" }}>{currentWord.ukphone ? (<><VoiceTag onClick={() => handleVoiceUK(currentWord.headWord, 1)}>英<VolumeUpIcon fontSize="small" /></VoiceTag><div style={{ marginRight: 6 }}>/{currentWord.ukphone}/</div></>) : null}</div>
                        <div style={{ display: "flex", marginBottom: "12px" }}>{currentWord.usphone ? (<><VoiceTag onClick={() => handleVoiceUS(currentWord.headWord, 2)}>美<VolumeUpIcon fontSize="small" /></VoiceTag><div>/{currentWord.usphone}/</div></>) : null}</div>
                    </FlexBasePhone>
                </WordLine>
                <WordLine>
                    <FlexBase>
                        <Tag>解釋</Tag>
                        <WordPosition><i>[{currentWord.pos}]</i></WordPosition>
                        <div>{currentWord.tranCN}</div>
                    </FlexBase>
                </WordLine>
                {currentWord.phrase ? (
                    <WordLine>
                        <PhraseBase>
                            <Tag>短語</Tag>
                            <div dangerouslySetInnerHTML={{ __html: `${currentWord.phrase}`.replace(currentWord.headWord, `<b>${currentWord.headWord}</b>`) }} />
                            <div>({currentWord.phraseCN})</div>
                        </PhraseBase>
                    </WordLine>
                ) : null}
                {currentWord.sentence ? (
                    <WordLine>
                        <PhraseBase>
                            <Tag>例句</Tag>
                            <div style={{ marginRight: 6 }} dangerouslySetInnerHTML={{ __html: `${currentWord.sentence}`.replace(currentWord.headWord, `<b>${currentWord.headWord}</b>`) }} />
                            <div>({currentWord.sentenceCN})</div>
                        </PhraseBase>
                    </WordLine>
                ) : null}
            </WordCard>
            <FlexAround>
                <ReverseButton onClick={() => setIsReverse(!isReverse)}>{isReverse ? "右" : "左"}</ReverseButton>
                <RightButton onClick={() => handleUScontent(currentWord.headWord, "en-GB")}>英<VolumeUpIcon fontSize="small" /></RightButton>
                <RightButton onClick={() => handleUScontent(currentWord.headWord, "en-US")}>美<VolumeUpIcon fontSize="small" /></RightButton>
                <RightButton onClick={() => handleUScontent(currentWord.phrase, "en-US")}>短語<VolumeUpIcon fontSize="small" /></RightButton>
                <RightButton onClick={() => handleUScontent(currentWord.sentence, "en-US")}>例句<VolumeUpIcon fontSize="small" /></RightButton>
                <RightButton disabled={processIdx <= 0} onClick={() => setProcessIdx(processIdx - 1)}>上一個</RightButton>

                {processIdx === words.length - 1 ? (
                    <RightButton onClick={handleStartTest} variant="contained">學好了<br />開始測試</RightButton>
                ) : (
                    <RightButton onClick={() => setProcessIdx(processIdx + 1)} variant="contained">下一個</RightButton>
                )}
            </FlexAround>
        </MainDiv >
    );
};

export default LearnProcess;
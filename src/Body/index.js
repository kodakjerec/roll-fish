import localforage from '../localForage';
import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import useMediaQuery from '@mui/material/useMediaQuery';
import LearnWords from './LearnWords';
import { LOCAL_SAVE } from '../meta';
import logo from '../assets/logo.png';

const LayoutCenter = styled.div`
    text-align: center;
`;

const Wrapper = styled.div`
    min-height: 80vh;
    padding: 16px 16px 32px 16px;
`;

const BodyImage = styled.img`
    margin: 16px;
    width: 180px;
`;

const Tips = styled.div`
    margin-top: 16px;
`;

const StyledPaper = styled(Paper)`
    padding: 16px 0.3rem 32px 0.3rem;

    ${({ matches }) => {
        return matches ? {
            width: 800,
            margin: '0 auto',
        } : {};
    }}
`;


const StartArea = styled(LayoutCenter)`
    margin-top: 16px;
    position: relative;
`;

const ClearArea = styled.div`
    position: absolute;
    top: 0;
    right: 0;
`;

const Body = () => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const [started, setStarted] = useState(false);

    const [openClear, setOpenClear] = useState(false);

    const handleOpenClear = useCallback(() => {
        setOpenClear(true);
    }, []);

    const handleCloseClear = useCallback(() => {
        setOpenClear(false);
    }, []);

    const handleClear = useCallback(() => {
        // console.log('clear');
        (async () => {

            try {
                await localforage.removeItem(LOCAL_SAVE);
                handleCloseClear();
            } catch (e) {
                console.error(e);
            }
        })();

    }, []);

    return (
        <Wrapper>
            <StyledPaper matches={!!matches ? 1 : undefined}>
                {started ? (
                    <>
                        <LearnWords />
                    </>
                ) : (
                    <>
                        <LayoutCenter>
                            <BodyImage src={logo} />
                            <Typography variant="h6" mb={2} align="center" color="inherit" component="div">這是一個利用摸魚時間背單字的軟件</Typography>
                            <Typography variant="h6" mb={2} align="center" color="inherit" component="div">可以讓你在上班、上課等惡劣環境下安全隱蔽地背單字</Typography>
                        </LayoutCenter>
                        <LayoutCenter>
                            <div>由於ToastFish只支持Win10+系統且只有本地程序，為了讓更多人能夠持續<b>學習進步</b>，作者 <a href='https://github.com/qhxin/roll-fish' target='_blank' rel='noopener noreferrer'>Uahh</a> 開發了這個WEB版。當前僅支持學英語。</div>
                            <Tips>Tips: 數據和部分功能來自於<a href='https://github.com/Uahh/ToastFish' target='_blank' rel='noopener noreferrer'>ToastFish</a></Tips>
                        </LayoutCenter>
                        <LayoutCenter><div style={{ fontSize: 10, color: 'orange' }}>如果你的設備PWA支援良好，建議安裝到本地使用。</div></ LayoutCenter>
                        <StartArea>
                            <Button size='large' variant='contained' onClick={() => setStarted(true)}>進入學習</Button>
                            <ClearArea>
                                <IconButton aria-label='delete' onClick={handleOpenClear}><DeleteIcon />
                                </IconButton>
                            </ClearArea>
                        </StartArea>
                        <Dialog open={openClear}
                            onClose={handleCloseClear}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description">
                            <DialogTitle id="alert-dialog-title">確定要清空本地數據嗎？ </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">清空本地數據意味著學習進度丟失，但如果你已經學完了，或者想從頭再卷，
                                    或者想升級到社區最新的詞庫（詞庫幾乎不可能更新了），那麼可以點擊確定清空。
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClear} sx={{ mr: 2 }}>確定清空</Button>
                                <Button variant="contained" onClick={handleCloseClear} autoFocus>取消</Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </StyledPaper>
        </Wrapper >
    );
};

export default Body;
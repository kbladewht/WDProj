package com.ht.action;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.ht.DAO.HTDAO;
import com.ht.DAO.base.ClassEntity;
import com.ht.builder.BeanFacadeUtil;
import com.ht.vo.Tiger;

public class WDList extends ActionBase {

	private static Logger log = Logger.getLogger(WDList.class);
	
	private static final long serialVersionUID = 1L;

	@Override
	public void doAction(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		log.info(" Hello World , HT ");
		
		
		HTDAO s = BeanFacadeUtil.getBean(HTDAO.class);
		
		
		Tiger t = new Tiger();
		
		t.setName("TaoTiger");
		
		List<Tiger> res = new ArrayList<Tiger>();
		
		res.add(t);
		
		s.batchSave(res);
		

		List<Tiger> list = s.getSQLQueryResults("select {a.*} from Tiger a", new Object[]{},ClassEntity.createAndAdd("a", Tiger.class));
		
		
		
		initializeCME(request, response);
		
		
		request.getRequestDispatcher("/HT/zbj.jsp").forward(request, response);

	}
	
	
	protected void initializeCME(final HttpServletRequest request, final HttpServletResponse response)  {

		final CMERuleView beanView = new CMERuleView();
		final String userId = RemoteUser.getRemoteUser(request);

		final List<CMEAppVO> appList = BeanFacadeUtil.getBean(HTDAO.class).getAllApps();
		

		beanView.setApps(appList);

		

		request.setAttribute("beanView", beanView);

	}

}

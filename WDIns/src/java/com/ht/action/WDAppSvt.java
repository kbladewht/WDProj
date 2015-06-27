package com.ht.action;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.ht.DAO.HTDAO;
import com.ht.builder.BeanFacadeUtil;

public class WDAppSvt extends ActionBase {

	static final long serialVersionUID = 7554268372993146367L;
	private static final String PAGE_FRAME = null;
	protected static Logger logger = Logger.getLogger(WDAppSvt.class);

	@Override
	public void doAction(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {

		String userId = RemoteUser.getRemoteUser(request);

		
		final String appIdE = request.getParameter("editId");
		if (appIdE != null && !appIdE.equals("")) {

			
			this.initializeCME(request, response);
			request.getRequestDispatcher(this.PAGE_FRAME).forward(request, response);
			return;

		}

	

		this.initializeCME(request, response);

		request.getRequestDispatcher(this.PAGE_FRAME).forward(request, response);

	}

	/**
	 * Page initialize
	 *
	 * @throws CMEException
	 */
	protected void initializeCME(final HttpServletRequest request, final HttpServletResponse response)  {

		final CMERuleView beanView = new CMERuleView();
		final String userId = RemoteUser.getRemoteUser(request);

		final List<CMEAppVO> appList = BeanFacadeUtil.getBean(HTDAO.class).getAllApps();
		

		beanView.setApps(appList);

		

		request.setAttribute("beanView", beanView);

	}



}
